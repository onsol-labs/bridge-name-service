// https://docs.metamask.io/guide/rpc-api.html#wallet-addethereumchain as per EIP-3085
export interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

// https://chainid.network/chains.json for chain info
export const METAMASK_CHAIN_PARAMETERS: {
  [evmChainId: number]: AddEthereumChainParameter;
} = {
  3: {
    chainId: "0x3",
    chainName: "Ropsten",
    nativeCurrency: { name: "Ropsten Ether", symbol: "ROP", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/eth_ropsten"],
    blockExplorerUrls: ["https://ropsten.etherscan.io"],
  },
  5: {
    chainId: "0x5",
    chainName: "Görli",
    nativeCurrency: { name: "Görli Ether", symbol: "GOR", decimals: 18 },
    rpcUrls: ["https://rpc.ankr.com/eth_goerli"],
    blockExplorerUrls: ["https://goerli.etherscan.io"],
  },
  42261: {
    chainId: "0xa515",
    chainName: "Emerald Paratime Testnet",
    nativeCurrency: { name: "Emerald Rose", symbol: "ROSE", decimals: 18 },
    rpcUrls: ["https://testnet.emerald.oasis.dev"],
    blockExplorerUrls: ["https://testnet.explorer.emerald.oasis.dev"],
  },
  80001: {
    chainId: "0x13881",
    chainName: "Mumbai",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
    rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
  },
  245022926: {
    chainId: "0xE9AC0CE",
    chainName: "remote proxy — solana devnet",
    nativeCurrency: { name: "NEON", symbol: "NEON", decimals: 18 },
    rpcUrls: ["https://proxy.devnet.neonlabs.org/solana"],
    blockExplorerUrls: ["https://neonscan.org/"],
  },
  1287: {
    chainId: "0x507",
    chainName: "Moonbase Alpha",
    nativeCurrency: { name: "Dev", symbol: "DEV", decimals: 18 },
    rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
    blockExplorerUrls: ["https://moonbase.moonscan.io"],
  },
  84531: {
    chainId: "0x14A33",
    chainName: "Base Goerli",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://goerli.base.org"],
    blockExplorerUrls: ["https://goerli.basescan.org"],
  },
};

export interface EvmRpcMap {
  [chainId: string]: string;
}

export const EVM_RPC_MAP = Object.entries(METAMASK_CHAIN_PARAMETERS).reduce(
  (evmRpcMap, [evmChainId, { rpcUrls }]) => {
    if (rpcUrls.length > 0) {
      evmRpcMap[evmChainId] = rpcUrls[0];
    }
    return evmRpcMap;
  },
  {} as EvmRpcMap
);
