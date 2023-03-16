import {
  ChainId,
  CHAIN_ID_SOLANA,
  getClaimAddressSolana,
  hexToUint8Array,
  isEVMChain,
  parseNFTPayload,
  parseVaa,
  postVaaSolanaWithRetry,
} from "@certusone/wormhole-sdk";
import {
  createMetaOnSolana,
  getForeignAssetSol,
  isNFTVAASolanaNative,
  redeemOnEth,
  redeemOnSolana,
} from "@certusone/wormhole-sdk/lib/esm/nft_bridge";
import { arrayify } from "@ethersproject/bytes";
import { Alert } from "@mui/material";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, Transaction, PublicKey } from "@solana/web3.js";
import { BigNumberish, Signer } from "ethers";
import { useSnackbar } from "notistack";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import { useSolanaWallet } from "../contexts/SolanaWalletContext";
import { setIsRedeeming, setRedeemTx } from "../store/nftSlice";
import { selectNFTIsRedeeming, selectNFTTargetChain } from "../store/selectors";
import {
  getNFTBridgeAddressForChain,
  MAX_VAA_UPLOAD_RETRIES_SOLANA,
  SOLANA_HOST,
  SOL_BRIDGE_ADDRESS,
  SOL_NFT_BRIDGE_ADDRESS,
} from "../utils/consts";
import { getMetadataAddress } from "../utils/metaplex";
import parseError from "../utils/parseError";
import { signSendAndConfirm } from "../utils/solana";
import useNFTSignedVAA from "./useNFTSignedVAA";
import { createNftAns, wrapDomain } from "../solana/handleInstructions";
import { BNS_ON_ETH, ENS_ON_ETH } from "../solana/constants";
import { BNS__factory } from "../ethers-contracts/abi";

async function evm(
  dispatch: any,
  enqueueSnackbar: any,
  signer: Signer,
  signedVAA: Uint8Array,
  chainId: ChainId,
  tokenID: BigNumberish
) {
  dispatch(setIsRedeeming(true));
  try {
    const overrides = {};
    const bridneNSContractAddress = BNS_ON_ETH;
    const ENSContractAddress = ENS_ON_ETH;
    const bnsContract = BNS__factory.connect(bridneNSContractAddress, signer);
    const ownerOfToken = await bnsContract.ownerOf(tokenID);
    if (ownerOfToken === getNFTBridgeAddressForChain(chainId)) {
      await redeemOnEth(
        getNFTBridgeAddressForChain(chainId),
        signer,
        signedVAA,
        overrides
      );
    }
    const receipt = await (await bnsContract.unwrapNFT(ENSContractAddress, tokenID, overrides)).wait();

    dispatch(
      setRedeemTx({ id: receipt.transactionHash, block: receipt.blockNumber })
    );
    enqueueSnackbar(null, {
      content: <Alert severity="success">Transaction confirmed</Alert>,
    });
  } catch (e) {
    enqueueSnackbar(null, {
      content: <Alert severity="error">{parseError(e)}</Alert>,
    });
    dispatch(setIsRedeeming(false));
  }
}

async function solana(
  dispatch: any,
  enqueueSnackbar: any,
  wallet: WalletContextState,
  payerAddress: string, //TODO: we may not need this since we have wallet
  signedVAA: Uint8Array
) {
  dispatch(setIsRedeeming(true));
  try {
    if (!wallet.signTransaction) {
      throw new Error("wallet.signTransaction is undefined");
    }
    const connection = new Connection(SOLANA_HOST, "confirmed");
    const claimAddress = await getClaimAddressSolana(
      SOL_NFT_BRIDGE_ADDRESS,
      signedVAA
    );
    const claimInfo = await connection.getAccountInfo(claimAddress);
    let txid;
    if (!claimInfo) {
      await postVaaSolanaWithRetry(
        connection,
        wallet.signTransaction,
        SOL_BRIDGE_ADDRESS,
        payerAddress,
        Buffer.from(signedVAA),
        MAX_VAA_UPLOAD_RETRIES_SOLANA
      );
      // TODO: how do we retry in between these steps
      const transaction = await redeemOnSolana(
        connection,
        SOL_BRIDGE_ADDRESS,
        SOL_NFT_BRIDGE_ADDRESS,
        payerAddress,
        signedVAA
      );
      txid = await signSendAndConfirm(wallet, connection, transaction);
      // TODO: didn't want to make an info call we didn't need, can we get the block without it by modifying the above call?
    }
    const isNative = await isNFTVAASolanaNative(signedVAA);
    if (!isNative) {
      const parsedVAA = parseVaa(signedVAA);
      const { originChain, originAddress, tokenId } = parseNFTPayload(
        Buffer.from(new Uint8Array(parsedVAA.payload))
      );
      const mintAddress = await getForeignAssetSol(
        SOL_NFT_BRIDGE_ADDRESS,
        originChain as ChainId,
        hexToUint8Array(originAddress),
        arrayify(tokenId)
      );
      const [metadataAddress] = await getMetadataAddress(mintAddress);
      const metadata = await connection.getAccountInfo(metadataAddress);
      if (!metadata) {
        const transaction = await createMetaOnSolana(
          connection,
          SOL_BRIDGE_ADDRESS,
          SOL_NFT_BRIDGE_ADDRESS,
          payerAddress,
          signedVAA
        );
        txid = await signSendAndConfirm(wallet, connection, transaction);
      }
      const { instructions, domainName } = await wrapDomain(connection, tokenId.toHexString(), new PublicKey(payerAddress))
      if (instructions.length > 1) {
        const transaction = new Transaction().add(...instructions);

        const { blockhash } = await connection.getLatestBlockhash('finalized');
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(payerAddress);
        txid = await signSendAndConfirm(wallet, connection, transaction);
      }
      const createAnsNftIx = await createNftAns(connection, domainName, new PublicKey(payerAddress));
      const txn = new Transaction().add(...createAnsNftIx);

      const { blockhash: newerBlockhash } = await connection.getLatestBlockhash('finalized');
      txn.recentBlockhash = newerBlockhash;
      txn.feePayer = new PublicKey(payerAddress);
      txid = await signSendAndConfirm(wallet, connection, txn);
    }
    dispatch(setRedeemTx({ id: txid || "", block: 1 }));
    enqueueSnackbar(null, {
      content: <Alert severity="success">Transaction confirmed</Alert>,
    });
  } catch (e) {
    enqueueSnackbar(null, {
      content: <Alert severity="error">{parseError(e)}</Alert>,
    });
    dispatch(setIsRedeeming(false));
  }
}

export function useHandleNFTRedeem() {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const targetChain = useSelector(selectNFTTargetChain);
  const solanaWallet = useSolanaWallet();
  const solPK = solanaWallet?.publicKey;
  const { signer } = useEthereumProvider();
  const signedVAA = useNFTSignedVAA();
  const isRedeeming = useSelector(selectNFTIsRedeeming);

  const handleRedeemClick = useCallback(() => {
    if (isEVMChain(targetChain) && !!signer && signedVAA) {
      const originTokenId = parseNFTPayload(
        Buffer.from(new Uint8Array(parseVaa(signedVAA).payload))
      ).tokenId;
      evm(dispatch, enqueueSnackbar, signer, signedVAA, targetChain, originTokenId);
    } else if (
      targetChain === CHAIN_ID_SOLANA &&
      !!solanaWallet &&
      !!solPK &&
      signedVAA
    ) {
      solana(
        dispatch,
        enqueueSnackbar,
        solanaWallet,
        solPK.toString(),
        signedVAA
      );
    } else {
    }
  }, [
    dispatch,
    enqueueSnackbar,
    targetChain,
    signer,
    signedVAA,
    solanaWallet,
    solPK,
  ]);
  return useMemo(
    () => ({
      handleClick: handleRedeemClick,
      disabled: !!isRedeeming,
      showLoader: !!isRedeeming,
    }),
    [handleRedeemClick, isRedeeming]
  );
}