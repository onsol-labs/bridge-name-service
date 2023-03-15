import { PublicKey } from "@solana/web3.js";
import { CLUSTER } from "../utils/consts";

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
export const ANS_PROGRAM_ID = new PublicKey(
  "ALTNSZ46uaAUU7XUV6awvdorLGqAsPwa9shm7h4uP2FK",
);
export const TLD_HOUSE_PROGRAM_ID = new PublicKey(
  "TLDHkysf5pCnKsVA4gXpNvmy7psXLPEu4LAdDJthT9S",
);
export const NAME_HOUSE_PROGRAM_ID = new PublicKey(
  "NH3uX6FtVE2fNREAioP7hm5RaozotZxeL6khU1EHx51",
);
export const TLD_ORIGIN = "ANS";
// export const ANS_PROGRAM_ID = new PublicKey(
//   "B4nDum6v4RLpyETk3MmU4rZpkZKt17PsY4bpRf46BEtN",
// );
// export const TLD_HOUSE_PROGRAM_ID = new PublicKey(
//   "TLDhatkjchgoteyVPXkKzAvVjj25wZ6ceEtEhsDAVjK",
// );
// export const NAME_HOUSE_PROGRAM_ID = new PublicKey(
//   "H8PAm4rHDBTcyVk9KLtfMH6rDkmyAX4YQCGBsmyR7sv3",
// );
// export const TLD_ORIGIN = "TEST105";
//export const BNS_SOL_PROGRAM_ID = new PublicKey("BQqpUU12TqvMm6NRwM9Lv7vKZLWwWzgaZh2Q2qvkmcbi")
export const BNS_SOL_PROGRAM_ID = new PublicKey("BNSwwSqW7HkAviEjNYhkMKws9jRerzMwb6yvKyYHPeqT")

//devnet
//export const WORMHOLE_PROGRAM_ID = new PublicKey("2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4")
//export const BNS_ON_ETH = "0x2b2E2629C8Ae7C991E0c3cEcB48b8ab4dc7299f3"
//export const BNS_ON_ETH_PADDED = "0000000000000000000000002b2E2629C8Ae7C991E0c3cEcB48b8ab4dc7299f3"

//mainnet
export const WORMHOLE_PROGRAM_ID = new PublicKey(
  CLUSTER === "mainnet" ?
    "WnFt12ZrnzZrFZkt2xsNsaNWoQribnuQ5B5FrDbwDhD" :
    "2rHhojZ7hpu1zA91nvZmT8TqWWvMcKmmNBCr2mKTtMq4"
)
export const BNS_ON_ETH =
  CLUSTER === "mainnet" ?
    "0x01b0cc6460f553e91c7ec3b75c0088e2ee42d332" :
    "0x2b2E2629C8Ae7C991E0c3cEcB48b8ab4dc7299f3";

export const BNS_ON_ETH_PADDED =
  CLUSTER === "mainnet" ?
    "00000000000000000000000001b0cc6460f553e91c7ec3b75c0088e2ee42d332" :
    "0000000000000000000000002b2E2629C8Ae7C991E0c3cEcB48b8ab4dc7299f3";


export const ENS_ON_ETH = "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85"
export const BNS_COLLECTION_ON_SOL = "AE9gUkwUJq4jAGyUqcv4roxV44T9aSzc28jK93e9w7r5";

export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);
export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);