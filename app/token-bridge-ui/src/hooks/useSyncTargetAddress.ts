import {
  cosmos,
  CHAIN_ID_SOLANA,
  CHAIN_ID_XPLA,
  isEVMChain,
  uint8ArrayToHex,
} from "@certusone/wormhole-sdk";
import { arrayify, zeroPad } from "@ethersproject/bytes";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import { useSolanaWallet } from "../contexts/SolanaWalletContext";
import { setTargetAddressHex as setNFTTargetAddressHex } from "../store/nftSlice";
import {
  selectNFTTargetAsset,
  selectNFTTargetChain,
  selectTransferTargetAsset,
  selectTransferTargetChain,
  selectTransferTargetParsedTokenAccount,
} from "../store/selectors";
import { setTargetAddressHex as setTransferTargetAddressHex } from "../store/transferSlice";
import { useConnectedWallet as useXplaConnectedWallet } from "@xpla/wallet-provider";

function useSyncTargetAddress(shouldFire: boolean, nft?: boolean) {
  const dispatch = useDispatch();
  const targetChain = useSelector(
    nft ? selectNFTTargetChain : selectTransferTargetChain
  );
  const { signerAddress } = useEthereumProvider();
  const solanaWallet = useSolanaWallet();
  const solPK = solanaWallet?.publicKey;
  const targetAsset = useSelector(
    nft ? selectNFTTargetAsset : selectTransferTargetAsset
  );
  const targetParsedTokenAccount = useSelector(
    selectTransferTargetParsedTokenAccount
  );
  const targetTokenAccountPublicKey = targetParsedTokenAccount?.publicKey;
  const xplaWallet = useXplaConnectedWallet();
  const setTargetAddressHex = nft
    ? setNFTTargetAddressHex
    : setTransferTargetAddressHex;
  useEffect(() => {
    if (shouldFire) {
      let cancelled = false;
      if (isEVMChain(targetChain) && signerAddress) {
        dispatch(
          setTargetAddressHex(
            uint8ArrayToHex(zeroPad(arrayify(signerAddress), 32))
          )
        );
      }
      // TODO: have the user explicitly select an account on solana
      else if (
        !nft && // only support existing, non-derived token accounts for token transfers (nft flow doesn't check balance)
        targetChain === CHAIN_ID_SOLANA &&
        targetTokenAccountPublicKey
      ) {
        // use the target's TokenAccount if it exists
        console.log(targetTokenAccountPublicKey)
        dispatch(
          setTargetAddressHex(
            uint8ArrayToHex(
              zeroPad(new PublicKey(targetTokenAccountPublicKey).toBytes(), 32)
            )
          )
        );
      } else if (targetChain === CHAIN_ID_SOLANA && solPK && targetAsset) {
        // otherwise, use the associated token account (which we create in the case it doesn't exist)
        (async () => {
          try {
            console.log('useSyncTargetAddress targetAsset: ', targetAsset)
            const associatedTokenAccount =
              await Token.getAssociatedTokenAddress(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                new PublicKey(targetAsset), // this might error
                solPK
              );
            if (!cancelled) {
              dispatch(
                setTargetAddressHex(
                  uint8ArrayToHex(zeroPad(associatedTokenAccount.toBytes(), 32))
                )
              );
            }
          } catch (e) {
            if (!cancelled) {
              dispatch(setTargetAddressHex(undefined));
            }
          }
        })();
      } else if (
        targetChain === CHAIN_ID_XPLA &&
        xplaWallet &&
        xplaWallet.walletAddress
      ) {
        dispatch(
          setTargetAddressHex(
            uint8ArrayToHex(
              zeroPad(cosmos.canonicalAddress(xplaWallet.walletAddress), 32)
            )
          )
        );
      } else {
        dispatch(setTargetAddressHex(undefined));
      }
      return () => {
        cancelled = true;
      };
    }
  }, [
    dispatch,
    shouldFire,
    targetChain,
    signerAddress,
    solPK,
    targetAsset,
    targetTokenAccountPublicKey,
    nft,
    setTargetAddressHex,
    xplaWallet,
  ]);
}

export default useSyncTargetAddress;
