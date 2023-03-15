import { PublicKey } from "@solana/web3.js";

export const TLD = process.env.TLD || ".eth";
export const ETH_ENVIRONMENT = process.env.ETH_ENVIRONMENT || "goerli";

export const SOLANA_ENVIRONMENT =
  process.env.SOLANA_ENVIRONMENT || "mainnet-beta";

export const TLD_HOUSE_AUTHORITY = new PublicKey(
  process.env.TLD_HOUSE_AUTHORITY ||
  "DaJVVD52pfVRZe7ArD7Y8GSQaUssSxgdtuTKgimtWzCx",
);