/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as beet from "@metaplex-foundation/beet";
import * as web3 from "@solana/web3.js";

/**
 * @category Instructions
 * @category RedeemRenewableNft
 * @category generated
 */
export type RedeemRenewableNftInstructionArgs = {
    tld: string;
    hashedName: Uint8Array;
    nameAccountBump: number;
};
/**
 * @category Instructions
 * @category RedeemRenewableNft
 * @category generated
 */
export const redeemRenewableNftStruct = new beet.FixableBeetArgsStruct<
    RedeemRenewableNftInstructionArgs & {
        instructionDiscriminator: number[] /* size: 8 */;
    }
>(
    [
        ["instructionDiscriminator", beet.uniformFixedSizeArray(beet.u8, 8)],
        ["tld", beet.utf8String],
        ["hashedName", beet.bytes],
        ["nameAccountBump", beet.u8],
    ],
    "RedeemRenewableNftInstructionArgs",
);
/**
 * Accounts required by the _redeemRenewableNft_ instruction
 *
 * @property [_writable_, **signer**] owner
 * @property [_writable_] mintAccount
 * @property [_writable_] mintAtaAccount
 * @property [_writable_] metadataAccount
 * @property [_writable_] tldHouse
 * @property [_writable_] nameHouse
 * @property [_writable_] nameAccount
 * @property [] nameClassAccount
 * @property [] nameParentAccount
 * @property [_writable_] nftRecord
 * @property [_writable_] collectionMint
 * @property [_writable_] collectionMetadata
 * @property [] collectionMasterEditionAccount
 * @property [] splTokenProgram
 * @property [] tokenMetadataProgram
 * @property [] altNameServiceProgram
 * @property [] instructionSysvarAccount
 * @category Instructions
 * @category RedeemRenewableNft
 * @category generated
 */
export type RedeemRenewableNftInstructionAccounts = {
    owner: web3.PublicKey;
    mintAccount: web3.PublicKey;
    mintAtaAccount: web3.PublicKey;
    metadataAccount: web3.PublicKey;
    tldHouse: web3.PublicKey;
    nameHouse: web3.PublicKey;
    nameAccount: web3.PublicKey;
    nameClassAccount: web3.PublicKey;
    nameParentAccount: web3.PublicKey;
    nftRecord: web3.PublicKey;
    collectionMint: web3.PublicKey;
    collectionMetadata: web3.PublicKey;
    collectionMasterEditionAccount: web3.PublicKey;
    splTokenProgram: web3.PublicKey;
    tokenMetadataProgram: web3.PublicKey;
    altNameServiceProgram: web3.PublicKey;
    instructionSysvarAccount?: web3.PublicKey;
    anchorRemainingAccounts?: web3.AccountMeta[];
};

export const redeemRenewableNftInstructionDiscriminator = [
    8, 137, 22, 75, 53, 86, 12, 192,
];

/**
 * Creates a _RedeemRenewableNft_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category RedeemRenewableNft
 * @category generated
 */
export function createRedeemRenewableNftInstruction(
    accounts: RedeemRenewableNftInstructionAccounts,
    args: RedeemRenewableNftInstructionArgs,
    programId = new web3.PublicKey(
        "NH3uX6FtVE2fNREAioP7hm5RaozotZxeL6khU1EHx51",
    ),
) {
    const [data] = redeemRenewableNftStruct.serialize({
        instructionDiscriminator: redeemRenewableNftInstructionDiscriminator,
        ...args,
    });
    const keys: web3.AccountMeta[] = [
        {
            pubkey: accounts.owner,
            isWritable: true,
            isSigner: true,
        },
        {
            pubkey: accounts.mintAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.mintAtaAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.metadataAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.tldHouse,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nameHouse,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nameAccount,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.nameClassAccount,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.nameParentAccount,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.nftRecord,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.collectionMint,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.collectionMetadata,
            isWritable: true,
            isSigner: false,
        },
        {
            pubkey: accounts.collectionMasterEditionAccount,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.splTokenProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.tokenMetadataProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey: accounts.altNameServiceProgram,
            isWritable: false,
            isSigner: false,
        },
        {
            pubkey:
                accounts.instructionSysvarAccount ??
                web3.SYSVAR_INSTRUCTIONS_PUBKEY,
            isWritable: false,
            isSigner: false,
        },
    ];

    if (accounts.anchorRemainingAccounts != null) {
        for (const acc of accounts.anchorRemainingAccounts) {
            keys.push(acc);
        }
    }

    const ix = new web3.TransactionInstruction({
        programId,
        keys,
        data,
    });
    return ix;
}