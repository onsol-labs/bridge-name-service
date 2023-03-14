import { PublicKey } from "@solana/web3.js";
export * from "./accounts";
export * from "./errors";
export * from "./instructions";
export * from "./types";

/**
 * Program address
 *
 * @category constants
 * @category generated
 */
// export const PROGRAM_ADDRESS = "NH3uX6FtVE2fNREAioP7hm5RaozotZxeL6khU1EHx51";
export const PROGRAM_ADDRESS = "H8PAm4rHDBTcyVk9KLtfMH6rDkmyAX4YQCGBsmyR7sv3";

/**
 * Program public key
 *
 * @category constants
 * @category generated
 */
export const PROGRAM_ID = new PublicKey(PROGRAM_ADDRESS);
