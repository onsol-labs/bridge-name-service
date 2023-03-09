import {
  ChainId,
  CHAIN_ID_SOLANA,
  CHAIN_ID_XPLA,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import EthereumSignerKey from "./EthereumSignerKey";
import SolanaWalletKey from "./SolanaWalletKey";
import XplaWalletKey from "./XplaWalletKey";

function KeyAndBalance({ chainId }: { chainId: ChainId }) {
  if (isEVMChain(chainId)) {
    return <EthereumSignerKey chainId={chainId} />;
  }
  if (chainId === CHAIN_ID_SOLANA) {
    return <SolanaWalletKey />;
  }
  if (chainId === CHAIN_ID_XPLA) {
    return <XplaWalletKey />;
  }
  return null;
}

export default KeyAndBalance;
