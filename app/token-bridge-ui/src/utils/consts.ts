import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  coalesceChainName,
  CONTRACTS,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { clusterApiUrl } from "@solana/web3.js";
import { getAddress } from "ethers/lib/utils";
import { CHAIN_CONFIG_MAP } from "../config";
import ethIcon from "../icons/eth.svg";
import solanaIcon from "../icons/solana.svg";

export type Cluster = "devnet" | "testnet" | "mainnet";
const urlParams = new URLSearchParams(window.location.search);
const paramCluster = urlParams.get("cluster");
export const CLUSTER: Cluster = paramCluster === "mainnet" ? "mainnet" : paramCluster === "devnet" ? "devnet" : "testnet";
export interface ChainInfo {
  id: ChainId;
  name: string;
  logo: string;
}
export const CHAINS: ChainInfo[] =
  CLUSTER === "mainnet"
    ? [
      {
        id: CHAIN_ID_ETH,
        name: "Ethereum",
        logo: ethIcon,
      },
      {
        id: CHAIN_ID_SOLANA,
        name: "Solana",
        logo: solanaIcon,
      },
    ] :
    CLUSTER === "testnet"
      ? [
        {
          id: CHAIN_ID_ETH,
          name: "Ethereum (Goerli)",
          logo: ethIcon,
        },
        {
          id: CHAIN_ID_SOLANA,
          name: "Solana",
          logo: solanaIcon,
        },
      ]
      : [
        {
          id: CHAIN_ID_ETH,
          name: "Ethereum",
          logo: ethIcon,
        },
        {
          id: CHAIN_ID_SOLANA,
          name: "Solana",
          logo: solanaIcon,
        }
      ];
export const CHAINS_WITH_NFT_SUPPORT = CHAINS.filter(
  ({ id }) =>
    id === CHAIN_ID_ETH ||
    id === CHAIN_ID_SOLANA
);
export type ChainsById = { [key in ChainId]: ChainInfo };
export const CHAINS_BY_ID: ChainsById = CHAINS.reduce((obj, chain) => {
  obj[chain.id] = chain;
  return obj;
}, {} as ChainsById);

export const COMING_SOON_CHAINS: ChainInfo[] = [];
export const getDefaultNativeCurrencySymbol = (chainId: ChainId) =>
  chainId === CHAIN_ID_SOLANA
    ? "SOL"
    : chainId === CHAIN_ID_ETH
      ? "ETH"
      : "";

export const getDefaultNativeCurrencyAddressEvm = (chainId: ChainId) => {
  return chainId === CHAIN_ID_ETH
    ? WETH_ADDRESS
    : "";
};

export const getExplorerName = (chainId: ChainId) =>
  chainId === CHAIN_ID_ETH
    ? "Etherscan"
    : chainId === CHAIN_ID_SOLANA
      ? "Solscan"
      : "Explorer";
export const WORMHOLE_RPC_HOSTS =
  CLUSTER === "mainnet"
    ? ["https://wormhole-v2-mainnet-api.certus.one"]
    : CLUSTER === "testnet"
      ? ["https://wormhole-v2-testnet-api.certus.one"]
      : ["http://localhost:7071"];
export const ETH_NETWORK_CHAIN_ID = CLUSTER === "mainnet" ? 1 : CLUSTER === "testnet" ? 5 : 1337;
export const getEvmChainId = (chainId: ChainId) =>
  chainId === CHAIN_ID_ETH
    ? ETH_NETWORK_CHAIN_ID
    : undefined;

export const SOLANA_HOST = process.env.REACT_APP_SOLANA_API_URL
  ? process.env.REACT_APP_SOLANA_API_URL
  : CLUSTER === "testnet"
    ? clusterApiUrl("devnet")
    : "http://localhost:8899";

export const SOL_CUSTODY_ADDRESS =
  "GugU1tP7doLeTw9hQP51xRJyS8Da1fWxuiy2rVrnMD2m";
export const SOL_NFT_CUSTODY_ADDRESS =
  "D63bhHo634eXSj4Jq3xgu2fjB5XKc8DFHzDY9iZk7fv1";

export const SOL_BRIDGE_ADDRESS =
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"].solana.core;

export const SOL_NFT_BRIDGE_ADDRESS =
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"].solana.nft_bridge;
export const SOL_TOKEN_BRIDGE_ADDRESS =
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"].solana.token_bridge;

export const getBridgeAddressForChain = (chainId: ChainId) =>
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"][
    coalesceChainName(chainId)
  ].core || "";
export const getNFTBridgeAddressForChain = (chainId: ChainId) =>
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"][
    coalesceChainName(chainId)
  ].nft_bridge || "";
export const getTokenBridgeAddressForChain = (chainId: ChainId) =>
  CONTRACTS[CLUSTER === "mainnet" ? "MAINNET" : CLUSTER === "testnet" ? "TESTNET" : "DEVNET"][
    coalesceChainName(chainId)
  ].token_bridge || "";

export const COVALENT_API_KEY = process.env.REACT_APP_COVALENT_API_KEY
  ? process.env.REACT_APP_COVALENT_API_KEY
  : "";

export const COVALENT_ETHEREUM = 5; // Covalent only supports mainnet and Kovan

export const GET_TOKENS_URL = (
  cluster: Cluster, 
  chainId: ChainId,
  walletAddress: string,
  nft?: boolean,
  noNftMetadata?: boolean
) => {
  if(cluster === "mainnet"){
    return `https://eth-mainnet.g.alchemy.com/v2/ODteMs1vRtOihFFIRAtr3WJIEg-V61W2/getNFTs/?owner=${walletAddress}`
  } else if(cluster === "devnet") {
    return `https://eth-goerli.g.alchemy.com/v2/xqzYNQBfiNgQPztNiM4mDvuc5R25ag8x/getNFTs/?owner=${walletAddress}`;
  } else {
    return `https://eth-goerli.g.alchemy.com/v2/xqzYNQBfiNgQPztNiM4mDvuc5R25ag8x/getNFTs/?owner=${walletAddress}`;
  }
};

export const COVALENT_GET_TOKENS_URL = (
  chainId: ChainId,
  walletAddress: string,
  nft?: boolean,
  noNftMetadata?: boolean
) => {
  const chainNum =
    chainId === CHAIN_ID_ETH
      ? COVALENT_ETHEREUM
      : "";
  // https://www.covalenthq.com/docs/api/#get-/v1/{chain_id}/address/{address}/balances_v2/
  return chainNum
    ? `https://eth-goerli.g.alchemy.com/v2/xqzYNQBfiNgQPztNiM4mDvuc5R25ag8x/getNFTs/?owner=${walletAddress}`
    //`https://api.covalenthq.com/v1/${chainNum}/address//balances_nft/?key=${COVALENT_API_KEY}`
    : "";
};

export const WETH_ADDRESS =
  CLUSTER === "testnet"
    ? "0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6"
    : "0xDDb64fE46a91D46ee29420539FC25FD07c5FEa3E";
export const WETH_DECIMALS = 18;

// hardcoded addresses for warnings
export const SOLANA_TOKENS_THAT_EXIST_ELSEWHERE = [
  "SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt", //  SRM
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
  "kinXdEcpDQeHPEuQnqmUgtYykqKGVFq6CeVX5iAHJq6", //  KIN
  "CDJWUqTcYTVAKXAVXoQZFes5JUFc7owSeq7eMQcDSbo5", // renBTC
  "8wv2KAykQstNAj2oW6AHANGBiFKVFhvMiyyzzjhkmGvE", // renLUNA
  "G1a6jxYz3m8DVyMqYnuV7s86wD4fvuXYneWSpLJkmsXj", // renBCH
  "FKJvvVJ242tX7zFtzTmzqoA631LqHh4CdgcN8dcfFSju", // renDGB
  "ArUkYE2XDKzqy77PRRGjo4wREWwqk6RXTfM9NeqzPvjU", // renDOGE
  "E99CQ2gFMmbiyK2bwiaFNWUUmwz4r8k2CVEFxwuvQ7ue", // renZEC
  "De2bU64vsXKU9jq4bCjeDxNRGPn8nr3euaTK8jBYmD3J", // renFIL
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
];
export const ETH_TOKENS_THAT_EXIST_ELSEWHERE = [
  getAddress("0x476c5E26a75bd202a9683ffD34359C0CC15be0fF"), // SRM
  getAddress("0x818fc6c2ec5986bc6e2cbf00939d90556ab12ce5"), // KIN
  getAddress("0xeb4c2781e4eba804ce9a9803c67d0893436bb27d"), // renBTC
  getAddress("0x52d87F22192131636F93c5AB18d0127Ea52CB641"), // renLUNA
  getAddress("0x459086f2376525bdceba5bdda135e4e9d3fef5bf"), // renBCH
  getAddress("0xe3cb486f3f5c639e98ccbaf57d95369375687f80"), // renDGB
  getAddress("0x3832d2F059E55934220881F831bE501D180671A7"), // renDOGE
  getAddress("0x1c5db575e2ff833e46a2e9864c22f4b22e0b37c2"), // renZEC
  getAddress("0xD5147bc8e386d91Cc5DBE72099DAC6C9b99276F5"), // renFIL
];
export const ETH_TOKENS_THAT_CAN_BE_SWAPPED_ON_SOLANA = [
  getAddress("0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"), // USDC
  getAddress("0xdac17f958d2ee523a2206206994597c13d831ec7"), // USDT
];

export const WORMHOLE_EXPLORER_BASE = "https://wormhole.com/explorer";

export const SOLANA_SYSTEM_PROGRAM_ADDRESS = "11111111111111111111111111111111";

export const getHowToAddTokensToWalletUrl = (chainId: ChainId) => {
  if (isEVMChain(chainId)) {
    return "https://docs.wormhole.com/wormhole/video-tutorial-how-to-manually-add-tokens-to-your-wallet#metamask";
  }
  return "";
};

export const getHowToAddToTokenListUrl = (chainId: ChainId) => {
  if (chainId === CHAIN_ID_SOLANA) {
    return "https://github.com/solana-labs/token-list";
  }
  return "";
};

export const SOLANA_TOKEN_METADATA_PROGRAM_URL =
  "https://github.com/metaplex-foundation/metaplex-program-library/tree/master/token-metadata/program";
export const MAX_VAA_UPLOAD_RETRIES_SOLANA = 5;

export const getIsTransferDisabled = (
  chainId: ChainId,
  isSourceChain: boolean
) => {
  const disableTransfers = CHAIN_CONFIG_MAP[chainId]?.disableTransfers;
  return disableTransfers === "from"
    ? isSourceChain
    : disableTransfers === "to"
      ? !isSourceChain
      : !!disableTransfers;
};

export type RelayerCompareAsset = {
  [key in ChainId]: string;
};
export const RELAYER_COMPARE_ASSET: RelayerCompareAsset = {
  [CHAIN_ID_SOLANA]: "solana",
  [CHAIN_ID_ETH]: "ethereum",
} as RelayerCompareAsset;
export const getCoinGeckoURL = (coinGeckoId: string) =>
  `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`;

export const RELAYER_INFO_URL =
  CLUSTER === "testnet" ? "" : "/relayerExample.json";

export const RELAY_URL_EXTENSION = "/relayvaa/";

export const getIsTokenTransferDisabled = (
  sourceChain: ChainId,
  targetChain: ChainId,
  tokenAddress: string
): boolean => {
  return false;
};

export const USD_NUMBER_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
