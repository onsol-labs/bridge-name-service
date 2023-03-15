import { Connection, Keypair, PublicKey } from "@solana/web3.js";

/* .xyz - for testing */
export const TLD = process.env.TLD || ".eth";
export const ETH_ENVIRONMENT = process.env.ETH_ENVIRONMENT || "goerli";

export const SHDW_ACCOUNT = new PublicKey(
  process.env.SHDW_ACCOUNT_PK ||
  "7TqD2ZrqV3u6kZefQLQ5cDqJgbHJmPjCH5bKNbB4YM91",
);
export const LOOKUP_TABLE_BNS = new PublicKey("7JdWUiBfBZMDyTBTi7GPEruQ41x7Me2S5mvH96WecVhV")

export const NAME_TOKENIZER_BUYER_KEYPAIR = new Keypair();

/* .abc */
// export const TLD = ".abc";
// export const SHDW_ACCOUNT = new PublicKey("9JG4fBiXuULnU5F9PgkJhzLKv1jHWxTf8kXRVnJoNr8T");

/* .bonk */
// export const TLD = ".bonk";
// export const SHDW_ACCOUNT = new PublicKey('6wGjzwHrHSKRkbsCPKKMivfwkP3WMnowdYh5VLeALTgc');

/* .poor */
// export const TLD = ".poor";
// export const SHDW_ACCOUNT = new PublicKey("ERghd8GeRoHFSzdtEqVQTN49db8NprJH12z46nEaDA8f");

export const SOLANA_ENVIRONMENT =
  process.env.SOLANA_ENVIRONMENT || "mainnet-beta";

//cluster urls
export const MAINNET =
  process.env.SOLANA_RPC_URL ||
  "https://rpc.helius.xyz/?api-key=a357afba-2171-4387-8073-e0402df45e33";

export const DEVNET =
  process.env.SOLANA_RPC_URL ||
  // "https://api.devnet.solana.com";
  "https://rpc-devnet.helius.xyz/?api-key=a357afba-2171-4387-8073-e0402df45e33";

/* connection */
export const CONNECTION = new Connection(MAINNET);
// export const CONNECTION = new Connection(
//   SOLANA_ENVIRONMENT == "mainnet-beta" ? MAINNET : DEVNET,
// );


export const TLD_HOUSE_AUTHORITY = new PublicKey(
  process.env.TLD_HOUSE_AUTHORITY ||
  "DaJVVD52pfVRZe7ArD7Y8GSQaUssSxgdtuTKgimtWzCx",
);