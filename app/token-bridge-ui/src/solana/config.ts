import { PublicKey } from "@solana/web3.js";
import { CLUSTER } from "../utils/consts";

export const TLD = process.env.TLD || ".eth";
export const ETH_ENVIRONMENT = CLUSTER === 'mainnet' ? 'mainnet' : "goerli";

export const SOLANA_ENVIRONMENT =
  process.env.SOLANA_ENVIRONMENT || "mainnet-beta";

export const TLD_HOUSE_AUTHORITY = new PublicKey(
  process.env.TLD_HOUSE_AUTHORITY ||
  "DaJVVD52pfVRZe7ArD7Y8GSQaUssSxgdtuTKgimtWzCx",
);

export const TLD_HOUSE_TREASURY = new PublicKey(
  process.env.TLD_HOUSE_TREASURY ||
  "2rWVMwtTQGDrG875uHmZWKot7zEUcqEjyyafh9kuVoFc",
);