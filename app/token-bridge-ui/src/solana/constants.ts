import { PublicKey } from "@solana/web3.js";

export const nftRecordDiscriminator = [174, 190, 114, 100, 177, 14, 90, 254];

export const NFT_RECORD_PREFIX = "nft_record";
export const NAME_HOUSE_PREFIX = "name_house";
export const COLLECTION_PREFIX = "name_collection";
export const HASH_PREFIX = "ALT Name Service";
export const TLD_HOUSE_PREFIX = "tld_house";
export const TLD_HOUSE_TREASURY_PREFIX = "treasury";
export const TLD_STATE_PREFIX = "tld_pda";

export const SOLANA_NATIVE_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112",
);
// export const ANS_PROGRAM_ID = new PublicKey(
//   "ALTNSZ46uaAUU7XUV6awvdorLGqAsPwa9shm7h4uP2FK",
// );
// export const TLD_HOUSE_PROGRAM_ID = new PublicKey(
//   "TLDHkysf5pCnKsVA4gXpNvmy7psXLPEu4LAdDJthT9S",
// );
// export const NAME_HOUSE_PROGRAM_ID = new PublicKey(
//   "NH3uX6FtVE2fNREAioP7hm5RaozotZxeL6khU1EHx51",
// );
// export const TLD_ORIGIN = "ANS";
export const ANS_PROGRAM_ID = new PublicKey(
  "B4nDum6v4RLpyETk3MmU4rZpkZKt17PsY4bpRf46BEtN",
);
export const TLD_HOUSE_PROGRAM_ID = new PublicKey(
  "TLDhatkjchgoteyVPXkKzAvVjj25wZ6ceEtEhsDAVjK",
);
export const NAME_HOUSE_PROGRAM_ID = new PublicKey(
  "H8PAm4rHDBTcyVk9KLtfMH6rDkmyAX4YQCGBsmyR7sv3",
);
export const TLD_ORIGIN = "TEST105";
export const BNS_SOL_PROGRAM_ID = new PublicKey("BQqpUU12TqvMm6NRwM9Lv7vKZLWwWzgaZh2Q2qvkmcbi")
export const WORMHOLE_PROGRAM_ID = new PublicKey("2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4")

export const BNS_ON_ETH = "0xEefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD"
export const BNS_ON_ETH_PADDED = "000000000000000000000000Eefa53A14d3D8f5dA253F0E0CbCf6B66e07F03fD"
export const ENS_ON_ETH = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"
export const BNS_COLLECTION_ON_SOL = "3i95YzbtxqUTFquCkaRYFyZhWJm4QWzeERLAhoWMmbHQ";
export const SHDW_TOKEN_MINT = new PublicKey(
  "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y",
);
export const SHDW_TOKEN_MINT_DEV = new PublicKey(
  "SHDWmahkzuFwa46CpG1BF3tBHUoBTfqpypWzLRL7vNX",
);

export const SHDW_STORAGE_ENDPOINT = "https://shadow-storage.genesysgo.net";
export const SHDW_DRIVE_ENDPOINT = "https://shdw-drive.genesysgo.net";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);