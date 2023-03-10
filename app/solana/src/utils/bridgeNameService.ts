import { keccak_256 } from "js-sha3";
import { PublicKey } from "@solana/web3.js";
import { BNS_ETH_PROGRAM_BUFFER, BNS_SOL_PROGRAM_ID, WORMHOLE_PROGRAM_ID } from "../constants";

export const hexToUint8Array = (h: string): Uint8Array =>
  new Uint8Array(Buffer.from(h, "hex"));

export function getWormholeMintAccount(domain: string) {
  const hexed_hashed_name = keccak_256(domain);
  const hashedUint8Array = hexToUint8Array(hexed_hashed_name)
  const chain_id = 2;// ETH CHAIN ID

  // BNS in ETH
  // const token_address = Buffer.from("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD", "hex");

  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("wrapped"),
      (() => {
        const buf = Buffer.alloc(2);
        buf.writeUInt16BE(chain_id as number);
        return buf;
      })(),
      BNS_ETH_PROGRAM_BUFFER,
      hashedUint8Array,
    ],
    WORMHOLE_PROGRAM_ID,
  );
}

export function findBNSVault() {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("bridge_name_service"),
    ],
    BNS_SOL_PROGRAM_ID,
  );
}