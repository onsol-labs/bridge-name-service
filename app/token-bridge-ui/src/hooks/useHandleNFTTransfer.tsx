import {
  ChainId,
  ChainName,
  CHAIN_ID_SOLANA,
  coalesceChainId,
  createNonce,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  getSignedVAAWithRetry,
  hexToUint8Array,
  isEVMChain,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  uint8ArrayToHex,
} from "@certusone/wormhole-sdk";
import { NFTImplementation__factory } from "@certusone/wormhole-sdk/lib/cjs/ethers-contracts";
import { NFTBridge__factory } from "@certusone/wormhole-sdk/lib/esm/ethers-contracts";
import {
  // transferFromEth,
  transferFromSolana,
} from "@certusone/wormhole-sdk/lib/esm/nft_bridge";
import { Alert } from "@mui/material";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { BigNumber, BigNumberish, ContractReceipt, Overrides, Signer } from "ethers";
import { arrayify, zeroPad } from "ethers/lib/utils";
import { useSnackbar } from "notistack";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BNS_ON_ETH, ENS_ON_ETH } from "../solana/constants";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import { useSolanaWallet } from "../contexts/SolanaWalletContext";
import { BNS__factory } from "../ethers-contracts/abi";
import {
  NFTParsedTokenAccount,
  setIsSending,
  setSignedVAAHex,
  setTransferTx,
} from "../store/nftSlice";
import {
  selectNFTIsSendComplete,
  selectNFTIsSending,
  selectNFTIsTargetComplete,
  selectNFTOriginAsset,
  selectNFTOriginChain,
  selectNFTOriginTokenId,
  selectNFTSourceAsset,
  selectNFTSourceChain,
  selectNFTSourceParsedTokenAccount,
  selectNFTTargetChain,
} from "../store/selectors";
import {
  getBridgeAddressForChain,
  getNFTBridgeAddressForChain,
  SOLANA_HOST,
  SOL_BRIDGE_ADDRESS,
  SOL_NFT_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from "../utils/consts";
import parseError from "../utils/parseError";
import { signSendAndConfirm } from "../utils/solana";
import useNFTTargetAddressHex from "./useNFTTargetAddress";
import { unwrapDomain } from "../solana/handleInstructions";
import { getAtaForMint, redeemRenewableNft } from "../solana/utils/name_house";
import { getNftOwner, getWormholeMintAccount } from "../solana/utils/bridgeNameService";

export async function transferFromEth(
  nftBridgeAddress: string,
  signer: Signer,
  tokenAddress: string,
  tokenID: BigNumberish,
  recipientChain: ChainId | ChainName,
  recipientAddress: Uint8Array,
  nftName: string,
  overrides: Overrides & { from?: string | Promise<string> } = {}
): Promise<ContractReceipt> {
  const bridneNSContractAddress = BNS_ON_ETH;
  const ENSContractAddress = ENS_ON_ETH;
  const recipientChainId = coalesceChainId(recipientChain);

  // approve transfer of ensToken to bnsContract
  const ensToken = NFTImplementation__factory.connect(tokenAddress, signer);
  const ownerOfToken = await ensToken.ownerOf(tokenID);
  if (ownerOfToken === await signer.getAddress()) {
    await (await ensToken.approve(bridneNSContractAddress, tokenID)).wait();

    // wraps ens token to bnsContract and creates bnsNFT
    const bnsContract = BNS__factory.connect(bridneNSContractAddress, signer);
    await (await bnsContract.wrapNFT(ENSContractAddress, tokenID, overrides)).wait();
  }
  // bridge the bnsToken to wormhole
  const bnsToken = NFTImplementation__factory.connect(bridneNSContractAddress, signer);
  await (await bnsToken.approve(nftBridgeAddress, tokenID)).wait();
  const bridge = NFTBridge__factory.connect(nftBridgeAddress, signer);
  const v = await bridge.transferNFT(
    bridneNSContractAddress,
    tokenID,
    recipientChainId,
    recipientAddress,
    createNonce(),
  );
  const receipt = await v.wait();
  return receipt;
}

async function evm(
  dispatch: any,
  enqueueSnackbar: any,
  signer: Signer,
  tokenAddress: string,
  tokenId: string,
  recipientChain: ChainId,
  recipientAddress: Uint8Array,
  chainId: ChainId,
  nftParsedTokenAccount: NFTParsedTokenAccount,
) {
  dispatch(setIsSending(true));
  try {
    const overrides = {}

    const receipt = await transferFromEth(
      getNFTBridgeAddressForChain(chainId),
      signer,
      tokenAddress,
      tokenId,
      recipientChain,
      recipientAddress,
      nftParsedTokenAccount.name!,
      overrides
    );
    dispatch(
      setTransferTx({ id: receipt.transactionHash, block: receipt.blockNumber })
    );
    enqueueSnackbar(null, {
      content: <Alert severity="success">Transaction confirmed</Alert>,
    });
    const sequence = parseSequenceFromLogEth(
      receipt,
      getBridgeAddressForChain(chainId)
    );
    const emitterAddress = getEmitterAddressEth(
      getNFTBridgeAddressForChain(chainId)
    );
    enqueueSnackbar(null, {
      content: <Alert severity="info">Fetching VAA</Alert>,
    });
    // console.log('sequence useHandleNFTTransfer', sequence.toString())
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      chainId,
      emitterAddress,
      sequence.toString()
    );
    dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
    enqueueSnackbar(null, {
      content: <Alert severity="success">Fetched Signed VAA</Alert>,
    });
  } catch (e) {
    console.error(e);
    enqueueSnackbar(null, {
      content: <Alert severity="error">{parseError(e)}</Alert>,
    });
    dispatch(setIsSending(false));
  }
}

async function solana(
  dispatch: any,
  enqueueSnackbar: any,
  wallet: WalletContextState,
  payerAddress: string, //TODO: we may not need this since we have wallet
  fromAddress: string,
  mintAddress: string,
  targetChain: ChainId,
  targetAddress: Uint8Array,
  originAddressStr?: string,
  originChain?: ChainId,
  originTokenId?: string,
  nftName?: string,
) {
  dispatch(setIsSending(true));
  try {
    const connection = new Connection(SOLANA_HOST, "confirmed");
    const originAddress = originAddressStr
      ? zeroPad(hexToUint8Array(originAddressStr), 32)
      : undefined;
    const [bnsMint] = getWormholeMintAccount(nftName!);
    const bnsNftOwner = await getNftOwner(connection, bnsMint);
    if (bnsNftOwner !== payerAddress) {
      const payerPubkey = new PublicKey(payerAddress)
      const computeUnitsIx = ComputeBudgetProgram.setComputeUnitLimit({
        units: 600000
      })
      const unwrapANStoBNSIX = await unwrapDomain(connection, nftName!, payerPubkey)
      const redeemRenewable = await redeemRenewableNft(connection, payerPubkey, nftName!)
      const txnRedeem = new Transaction().add(computeUnitsIx, redeemRenewable!, unwrapANStoBNSIX);

      const { blockhash: newBlockhash } = await connection.getLatestBlockhash('finalized');
      txnRedeem.recentBlockhash = newBlockhash;
      txnRedeem.feePayer = payerPubkey
      await signSendAndConfirm(wallet, connection, txnRedeem);
    }
    // this expectes a BNS NFT in ETH
    const [bnsMintAta] = getAtaForMint(bnsMint, new PublicKey(payerAddress))
    const transaction = await transferFromSolana(
      connection,
      SOL_BRIDGE_ADDRESS,
      SOL_NFT_BRIDGE_ADDRESS,
      payerAddress,
      bnsMintAta.toBase58(),
      bnsMint.toBase58(),
      targetAddress,
      targetChain,
      originAddress,
      originChain,
      arrayify(BigNumber.from(originTokenId || "0"))
    );
    const txid = await signSendAndConfirm(wallet, connection, transaction);
    enqueueSnackbar(null, {
      content: <Alert severity="success">Transaction confirmed</Alert>,
    });
    const info = await connection.getTransaction(txid);
    if (!info) {
      throw new Error("An error occurred while fetching the transaction info");
    }
    dispatch(setTransferTx({ id: txid, block: info.slot }));
    const sequence = parseSequenceFromLogSolana(info);
    const emitterAddress = await getEmitterAddressSolana(
      SOL_NFT_BRIDGE_ADDRESS
    );
    enqueueSnackbar(null, {
      content: <Alert severity="info">Fetching VAA</Alert>,
    });
    const { vaaBytes } = await getSignedVAAWithRetry(
      WORMHOLE_RPC_HOSTS,
      CHAIN_ID_SOLANA,
      emitterAddress,
      sequence
    );

    dispatch(setSignedVAAHex(uint8ArrayToHex(vaaBytes)));
    enqueueSnackbar(null, {
      content: <Alert severity="success">Fetched Signed VAA</Alert>,
    });
  } catch (e) {
    console.error(e);
    enqueueSnackbar(null, {
      content: <Alert severity="error">{parseError(e)}</Alert>,
    });
    dispatch(setIsSending(false));
  }
}

export function useHandleNFTTransfer() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const sourceChain = useSelector(selectNFTSourceChain);
  const sourceAsset = useSelector(selectNFTSourceAsset);
  const nftSourceParsedTokenAccount = useSelector(
    selectNFTSourceParsedTokenAccount
  );
  const sourceTokenId = nftSourceParsedTokenAccount?.tokenId || ""; // this should exist by this step for NFT transfers
  const originChain = useSelector(selectNFTOriginChain);
  const originAsset = useSelector(selectNFTOriginAsset);
  const originTokenId = useSelector(selectNFTOriginTokenId);
  const targetChain = useSelector(selectNFTTargetChain);
  const targetAddress = useNFTTargetAddressHex();
  const isTargetComplete = useSelector(selectNFTIsTargetComplete);
  const isSending = useSelector(selectNFTIsSending);
  const isSendComplete = useSelector(selectNFTIsSendComplete);
  const { signer } = useEthereumProvider();
  const solanaWallet = useSolanaWallet();
  const solPK = solanaWallet?.publicKey;
  const sourceParsedTokenAccount = useSelector(
    selectNFTSourceParsedTokenAccount
  );
  const sourceTokenPublicKey = sourceParsedTokenAccount?.publicKey;
  const disabled = !isTargetComplete || isSending || isSendComplete;
  // console.log("targetAddress", textToHexString(targetAddress))
  const handleTransferClick = useCallback(() => {
    // TODO: we should separate state for transaction vs fetching vaa
    if (
      isEVMChain(sourceChain) &&
      !!signer &&
      !!sourceAsset &&
      !!sourceTokenId &&
      !!targetAddress &&
      nftSourceParsedTokenAccount
    ) {
      evm(
        dispatch,
        enqueueSnackbar,
        signer,
        sourceAsset,
        sourceTokenId,
        targetChain,
        targetAddress,
        sourceChain,
        nftSourceParsedTokenAccount
      );
    } else if (
      sourceChain === CHAIN_ID_SOLANA &&
      !!solanaWallet &&
      !!solPK &&
      !!sourceAsset &&
      !!sourceTokenPublicKey &&
      !!targetAddress
    ) {
      solana(
        dispatch,
        enqueueSnackbar,
        solanaWallet,
        solPK.toString(),
        sourceTokenPublicKey,
        sourceAsset,
        targetChain,
        targetAddress,
        originAsset,
        originChain,
        originTokenId,
        nftSourceParsedTokenAccount?.name
      );
    } else {
    }
  }, [
    dispatch,
    enqueueSnackbar,
    sourceChain,
    signer,
    solanaWallet,
    solPK,
    sourceTokenPublicKey,
    sourceAsset,
    sourceTokenId,
    targetChain,
    targetAddress,
    originAsset,
    originChain,
    originTokenId,
  ]);
  return useMemo(
    () => ({
      handleClick: handleTransferClick,
      disabled,
      showLoader: isSending,
    }),
    [handleTransferClick, disabled, isSending]
  );
}
