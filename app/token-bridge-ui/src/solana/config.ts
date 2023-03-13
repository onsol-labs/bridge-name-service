import { Connection, Keypair, PublicKey } from "@solana/web3.js";

/* .xyz - for testing */
export const TLD = process.env.TLD || ".eth";
export const ETH_ENVIRONMENT = process.env.ETH_ENVIRONMENT || "goerli";

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

export const TLD_HOUSE_AUTHORITY = new PublicKey(
  process.env.TLD_HOUSE_AUTHORITY ||
  "TLDnouMsypo9L4TTzPrpr7MEghoiu3o16RDt5VJRpni",
);