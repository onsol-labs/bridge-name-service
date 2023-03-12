import { keccak_256 } from "js-sha3";
import { PublicKey, Connection, AccountInfo } from "@solana/web3.js";
import { BNS_ETH_PROGRAM_BUFFER, BNS_SOL_PROGRAM_ID, WORMHOLE_PROGRAM_ID } from "../constants";
import { BinaryReader, deserializeUnchecked, Schema } from "borsh";

export const hexToUint8Array = (h: string): Uint8Array =>
  new Uint8Array(Buffer.from(h, "hex"));

export function getWormholeMintAccountFromTokenId(tokenId: string): PublicKey {
  const hashedUint8Array = hexToUint8Array(tokenId)
  const chain_id = 2;// ETH CHAIN ID

  // BNS in ETH
  // const token_address = Buffer.from("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD", "hex");
  const [bnsMint] = PublicKey.findProgramAddressSync(
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
  )
  return bnsMint
}

export function getWormholeMintAccount(domain: string): [PublicKey, string] {
  const hexed_hashed_name = keccak_256(domain);
  const hashedUint8Array = hexToUint8Array(hexed_hashed_name)
  const chain_id = 2;// ETH CHAIN ID

  // BNS in ETH
  // const token_address = Buffer.from("000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD", "hex");
  const [bnsMint] = PublicKey.findProgramAddressSync(
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
  )
  return [bnsMint, hexed_hashed_name]
}

export function findBNSVault() {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("bridge_name_service"),
    ],
    BNS_SOL_PROGRAM_ID,
  );
}

/**
 * Holds the data for the {@link NameRecordHeader} Account and provides de/serialization
 * functionality for that data
 */
export class NameRecordHeaderRaw {
  constructor(obj: {
    parentName: Uint8Array;
    owner: Uint8Array;
    nclass: Uint8Array;
    expiresAt: Uint8Array;
  }) {
    this.parentName = new PublicKey(obj.parentName);
    this.nclass = new PublicKey(obj.nclass);
    this.expiresAt = new Date(
      new BinaryReader(Buffer.from(obj.expiresAt)).readU64().toNumber() *
      1000,
    );
    this.isValid =
      new BinaryReader(Buffer.from(obj.expiresAt))
        .readU64()
        .toNumber() === 0
        ? true
        : this.expiresAt > new Date();
    this.owner = this.isValid ? new PublicKey(obj.owner) : undefined;
    this.expiresAtBuffer = Buffer.from(obj.expiresAt);
  }

  parentName: PublicKey;
  owner: PublicKey | undefined;
  nclass: PublicKey;
  expiresAt: Date;
  isValid: boolean;
  expiresAtBuffer: Buffer;
  data: Buffer | undefined;

  static DISCRIMINATOR = [68, 72, 88, 44, 15, 167, 103, 243];
  static HASH_PREFIX = "ALT Name Service";

  /**
   * NameRecordHeader Schema across all alt name service accounts
   */
  static schema: Schema = new Map([
    [
      NameRecordHeaderRaw,
      {
        kind: "struct",
        fields: [
          ["discriminator", [8]],
          ["parentName", [32]],
          ["owner", [32]],
          ["nclass", [32]],
          ["expiresAt", [8]],
          ["padding", [88]],
        ],
      },
    ],
  ]);

  /**
   * Returns the minimum size of a {@link Buffer} holding the serialized data of
   * {@link NameRecordHeader}
   */
  static get byteSize() {
    return 8 + 32 + 32 + 32 + 8 + 88;
  }

  /**
   * Retrieves the account info from the provided address and deserializes
   * the {@link NameRecordHeader} from its data.
   */
  public static async fromAccountAddress(
    connection: Connection,
    nameAccountKey: PublicKey,
  ): Promise<NameRecordHeaderRaw | undefined> {
    const nameAccount = await connection.getAccountInfo(
      nameAccountKey,
      "confirmed",
    );
    if (!nameAccount) {
      return undefined;
    }

    const res: NameRecordHeaderRaw = deserializeUnchecked(
      this.schema,
      NameRecordHeaderRaw,
      nameAccount.data,
    );

    res.data = nameAccount.data?.subarray(this.byteSize);

    return res;
  }

  /**
   * Retrieves the account info from the provided data and deserializes
   * the {@link NameRecordHeader} from its data.
   */
  public static fromAccountInfo(
    nameAccountAccountInfo: AccountInfo<Buffer>,
  ): NameRecordHeaderRaw {
    const res: NameRecordHeaderRaw = deserializeUnchecked(
      this.schema,
      NameRecordHeaderRaw,
      nameAccountAccountInfo.data,
    );
    res.data = nameAccountAccountInfo.data?.subarray(this.byteSize);
    return res;
  }

  // /**
  //  * Returns a readable version of {@link NameRecordHeader} properties
  //  * and can be used to convert to JSON and/or logging
  //  */
  // pretty() {
  //   const indexOf0 = this.data?.indexOf(0x00);
  //   return {
  //     parentName: this.parentName.toBase58(),
  //     owner: this.owner?.toBase58(),
  //     nclass: this.nclass.toBase58(),
  //     expiresAt: this.expiresAt,
  //     isValid: this.isValid,
  //     data: this.isValid
  //       ? this.data?.subarray(0, indexOf0).toString()
  //       : undefined,
  //   };
  // }
}
