import {
  ChainId,
  CHAIN_ID_SOLANA,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { hexlify, hexStripZeros } from "@ethersproject/bytes";
import { useCallback, useMemo } from "react";
import {
  ConnectType,
  useEthereumProvider,
} from "../contexts/EthereumProviderContext";
import { useSolanaWallet } from "../contexts/SolanaWalletContext";
import { CLUSTER, getEvmChainId } from "../utils/consts";
import {
  EVM_RPC_MAP,
  METAMASK_CHAIN_PARAMETERS,
} from "../utils/metaMaskChainParameters";

const createWalletStatus = (
  isReady: boolean,
  statusMessage: string = "",
  forceNetworkSwitch: () => void,
  walletAddress?: string
) => ({
  isReady,
  statusMessage,
  forceNetworkSwitch,
  walletAddress,
});

function useIsWalletReady(
  chainId: ChainId,
  enableNetworkAutoswitch: boolean = true
): {
  isReady: boolean;
  statusMessage: string;
  walletAddress?: string;
  forceNetworkSwitch: () => void;
} {
  const autoSwitch = enableNetworkAutoswitch;
  const solanaWallet = useSolanaWallet();
  const solPK = solanaWallet?.publicKey;
  const {
    provider,
    signerAddress,
    chainId: evmChainId,
    connectType,
    disconnect,
  } = useEthereumProvider();
  const hasEthInfo = !!provider && !!signerAddress;
  const correctEvmNetwork = getEvmChainId(chainId);
  const hasCorrectEvmNetwork = evmChainId === correctEvmNetwork;
  // The wallets do not all match on network names and the adapter doesn't seem to normalize this yet.
  // Petra = "Testnet"
  // Martian = "Testnet"
  // Nightly = undefined... error on NightlyWallet.ts

  const forceNetworkSwitch = useCallback(async () => {
    if (provider && correctEvmNetwork) {
      if (!isEVMChain(chainId)) {
        return;
      }
      if (
        connectType === ConnectType.WALLETCONNECT &&
        EVM_RPC_MAP[correctEvmNetwork] === undefined
      ) {
        // WalletConnect requires a rpc url for this chain
        // Force user to switch connect type
        disconnect();
        return;
      }

      try {
        await provider.send("wallet_switchEthereumChain", [
          { chainId: hexStripZeros(hexlify(correctEvmNetwork)) },
        ]);
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          const addChainParameter =
            METAMASK_CHAIN_PARAMETERS[correctEvmNetwork];
          if (addChainParameter !== undefined) {
            try {
              await provider.send("wallet_addEthereumChain", [
                addChainParameter,
              ]);
            } catch (addError) {
              console.error(addError);
            }
          }
        }
      }
    }
  }, [provider, correctEvmNetwork, chainId, connectType, disconnect]);

  return useMemo(() => {
    if (chainId === CHAIN_ID_SOLANA && solPK) {
      return createWalletStatus(
        true,
        undefined,
        forceNetworkSwitch,
        solPK.toString()
      );
    }
    if (isEVMChain(chainId) && hasEthInfo && signerAddress) {
      if (hasCorrectEvmNetwork) {
        return createWalletStatus(
          true,
          undefined,
          forceNetworkSwitch,
          signerAddress
        );
      } else {
        if (provider && correctEvmNetwork && autoSwitch) {
          forceNetworkSwitch();
        }
        return createWalletStatus(
          false,
          `Wallet is not connected to ${CLUSTER}. Expected Chain ID: ${correctEvmNetwork}`,
          forceNetworkSwitch,
          undefined
        );
      }
    }

    return createWalletStatus(
      false,
      "Wallet not connected",
      forceNetworkSwitch,
      undefined
    );
  }, [
    chainId,
    autoSwitch,
    forceNetworkSwitch,
    solPK,
    hasEthInfo,
    correctEvmNetwork,
    hasCorrectEvmNetwork,
    provider,
    signerAddress,
  ]);
}

export default useIsWalletReady;
