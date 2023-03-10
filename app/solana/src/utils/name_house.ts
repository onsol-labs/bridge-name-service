import bs58 from "bs58";
import {
  COLLECTION_PREFIX,
  HASH_PREFIX,
  nftRecordDiscriminator,
  ANS_PROGRAM_ID,
  NFT_RECORD_PREFIX,
  TLD_HOUSE_PREFIX,
  TLD_HOUSE_PROGRAM_ID,
  NAME_HOUSE_PREFIX,
  TLD_STATE_PREFIX,
  TLD_ORIGIN,
  NAME_HOUSE_PROGRAM_ID,
  TLD_HOUSE_TREASURY_PREFIX,
} from "../constants";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { createHash } from "crypto";
import fs from "fs";
import emojiRegex from "emoji-regex";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID, TOKEN_PROGRAM_ID } from "../constants";

//emoji Regex
const regex = emojiRegex();

export async function findTldState() {
  return await PublicKey.findProgramAddress(
    [Buffer.from(TLD_STATE_PREFIX)],
    TLD_HOUSE_PROGRAM_ID,
  );
}

export function findTldTreasuryManager(tldString: string) {
  tldString = tldString.toLowerCase();
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TLD_HOUSE_PREFIX), Buffer.from(tldString), Buffer.from(TLD_HOUSE_TREASURY_PREFIX)],
    TLD_HOUSE_PROGRAM_ID,
  );
}


export function findRenewableMintAddress(
  nameAccount: PublicKey,
  nameHouseAccount: PublicKey,
  expiresAtBuffer: Buffer,
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(NAME_HOUSE_PREFIX),
      nameHouseAccount.toBuffer(),
      nameAccount.toBuffer(),
      expiresAtBuffer,
    ],
    NAME_HOUSE_PROGRAM_ID,
  );
}

export function findTldHouse(tldString: string) {
  tldString = tldString.toLowerCase();
  return PublicKey.findProgramAddressSync(
    [Buffer.from(TLD_HOUSE_PREFIX), Buffer.from(tldString)],
    TLD_HOUSE_PROGRAM_ID,
  );
}

export function findNameHouse(tldHouse: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(NAME_HOUSE_PREFIX), tldHouse.toBuffer()],
    NAME_HOUSE_PROGRAM_ID,
  );
}

export function findNameRecord(
  nameAccount: PublicKey,
  nameHouseAccount: PublicKey,
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(NFT_RECORD_PREFIX),
      nameHouseAccount.toBuffer(),
      nameAccount.toBuffer(),
    ],
    NAME_HOUSE_PROGRAM_ID,
  );
}

export function findMintAddress(
  nameAccount: PublicKey,
  nameHouseAccount: PublicKey,
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from(NAME_HOUSE_PREFIX),
      nameHouseAccount.toBuffer(),
      nameAccount.toBuffer(),
    ],
    NAME_HOUSE_PROGRAM_ID,
  );
}

export const getAtaForMint = (
  mint: PublicKey,
  account: PublicKey,
): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [account.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  );
};

export const getMasterEdition = (
  mint: PublicKey,
): PublicKey => {
  return (
    PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
        Buffer.from('edition'),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};

export const getMetadata = (
  mint: PublicKey,
): PublicKey => {
  return (
    PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )
  )[0];
};


export function findCollectionMint(tldHouse: PublicKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(COLLECTION_PREFIX), tldHouse.toBuffer()],
    NAME_HOUSE_PROGRAM_ID,
  );
}
export async function getHashedName(name: string): Promise<Buffer> {
  const input = HASH_PREFIX + name;
  const buffer = createHash("sha256").update(input, "utf8").digest();
  return buffer;
}

export async function getNameAccountKey(
  hashedName: Buffer,
  nameClass?: PublicKey,
  nameParent?: PublicKey,
): Promise<[PublicKey, number]> {
  const seeds = [
    hashedName,
    nameClass ? nameClass.toBuffer() : Buffer.alloc(32),
    nameParent ? nameParent.toBuffer() : Buffer.alloc(32),
  ];

  return await PublicKey.findProgramAddress(seeds, ANS_PROGRAM_ID);
}

export const getParentNameKeyWithBump = async (tldName: string) => {
  const [nameOriginTldKey] = await getOriginNameAccountKey();
  console.log("nameOriginTldKey: ", nameOriginTldKey.toBase58());
  const parentHashedName = await getHashedName(tldName);
  return await getNameAccountKey(
    parentHashedName,
    undefined,
    nameOriginTldKey,
  );
};

export const getNameKeyWithBump = async (name: string, tldName: string) => {
  const [nameOriginTldKey] = await getOriginNameAccountKey();
  const parentHashedName = await getHashedName(tldName);
  const [parentAccountKey] = await getNameAccountKey(
    parentHashedName,
    undefined,
    nameOriginTldKey,
  );

  const hashedDomainName = await getHashedName(name);
  return await getNameAccountKey(
    hashedDomainName,
    undefined,
    parentAccountKey,
  );
};

export const resolveDomainNamePoor = async (
  connection: Connection,
  domainTld: string,
): Promise<PublicKey | undefined> => {
  const domainTldSplit = domainTld.split(".");
  const domain = domainTldSplit[0];
  const tldName = "." + domainTldSplit[1];
  const [key] = await getNameKeyWithBump(domain, tldName);
  const accountInfo = await connection.getAccountInfo(key);
  const decodedData = accountInfo?.data.subarray(32, 64);
  const nftOwner = new PublicKey(decodedData!);
  return nftOwner;
};

export async function getOriginNameAccountKey() {
  const hashed_name = await getHashedName(TLD_ORIGIN);
  const nameAccountKey = await getNameAccountKey(
    hashed_name,
    undefined,
    undefined,
  );
  return nameAccountKey;
}

export function getKeypairFromFile(path: any) {
  const keypairString = fs.readFileSync(path, { encoding: "utf-8" });
  const keyPairBuffer = Buffer.from(JSON.parse(keypairString));
  return Keypair.fromSecretKey(keyPairBuffer);
}
