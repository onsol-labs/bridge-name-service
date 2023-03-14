/**
 * This code was GENERATED using the solita package.
 * Please DO NOT EDIT THIS FILE, instead rerun solita to update it or write a wrapper to add functionality.
 *
 * See: https://github.com/metaplex-foundation/solita
 */

import * as splToken from '@solana/spl-token'
import * as beet from '@metaplex-foundation/beet'
import * as web3 from '@solana/web3.js'

/**
 * @category Instructions
 * @category RedeemNft
 * @category generated
 */
export type RedeemNftInstructionArgs = {
  tld: string
  hashedName: Uint8Array
  thBump: number
  name: string
}
/**
 * @category Instructions
 * @category RedeemNft
 * @category generated
 */
export const redeemNftStruct = new beet.FixableBeetArgsStruct<
  RedeemNftInstructionArgs & {
    instructionDiscriminator: number[] /* size: 8 */
  }
>(
  [
    ['instructionDiscriminator', beet.uniformFixedSizeArray(beet.u8, 8)],
    ['tld', beet.utf8String],
    ['hashedName', beet.bytes],
    ['thBump', beet.u8],
    ['name', beet.utf8String],
  ],
  'RedeemNftInstructionArgs'
)
/**
 * Accounts required by the _redeemNft_ instruction
 *
 * @property [_writable_, **signer**] owner
 * @property [_writable_] bnsVault
 * @property [_writable_] vaultAtaAccount
 * @property [] tldState
 * @property [_writable_] tldHouse
 * @property [_writable_] nameAccount
 * @property [_writable_] bnsMintAccount
 * @property [_writable_] bnsMintAtaAccount
 * @property [_writable_] ansMintAccount
 * @property [] nameClassAccount
 * @property [_writable_] nameParentAccount
 * @property [] tldHouseProgram
 * @property [] altNameServiceProgram
 * @category Instructions
 * @category RedeemNft
 * @category generated
 */
export type RedeemNftInstructionAccounts = {
  owner: web3.PublicKey
  bnsVault: web3.PublicKey
  vaultAtaAccount: web3.PublicKey
  tldState: web3.PublicKey
  tldHouse: web3.PublicKey
  nameAccount: web3.PublicKey
  bnsMintAccount: web3.PublicKey
  bnsMintAtaAccount: web3.PublicKey
  ansMintAccount: web3.PublicKey
  nameClassAccount: web3.PublicKey
  nameParentAccount: web3.PublicKey
  ataProgram?: web3.PublicKey
  tokenProgram?: web3.PublicKey
  tldHouseProgram: web3.PublicKey
  altNameServiceProgram: web3.PublicKey
  systemProgram?: web3.PublicKey
  rent?: web3.PublicKey
  anchorRemainingAccounts?: web3.AccountMeta[]
}

export const redeemNftInstructionDiscriminator = [
  113, 9, 91, 16, 166, 235, 118, 133,
]

/**
 * Creates a _RedeemNft_ instruction.
 *
 * @param accounts that will be accessed while the instruction is processed
 * @param args to provide as instruction data to the program
 *
 * @category Instructions
 * @category RedeemNft
 * @category generated
 */
export function createRedeemNftInstruction(
  accounts: RedeemNftInstructionAccounts,
  args: RedeemNftInstructionArgs,
  programId = new web3.PublicKey('BNSwwSqW7HkAviEjNYhkMKws9jRerzMwb6yvKyYHPeqT')
) {
  const [data] = redeemNftStruct.serialize({
    instructionDiscriminator: redeemNftInstructionDiscriminator,
    ...args,
  })
  const keys: web3.AccountMeta[] = [
    {
      pubkey: accounts.owner,
      isWritable: true,
      isSigner: true,
    },
    {
      pubkey: accounts.bnsVault,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.vaultAtaAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.tldState,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tldHouse,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.nameAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.bnsMintAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.bnsMintAtaAccount,
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.ansMintAccount,
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
      isWritable: true,
      isSigner: false,
    },
    {
      pubkey: accounts.ataProgram ?? splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tokenProgram ?? splToken.TOKEN_PROGRAM_ID,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.tldHouseProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.altNameServiceProgram,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.systemProgram ?? web3.SystemProgram.programId,
      isWritable: false,
      isSigner: false,
    },
    {
      pubkey: accounts.rent ?? web3.SYSVAR_RENT_PUBKEY,
      isWritable: false,
      isSigner: false,
    },
  ]

  if (accounts.anchorRemainingAccounts != null) {
    for (const acc of accounts.anchorRemainingAccounts) {
      keys.push(acc)
    }
  }

  const ix = new web3.TransactionInstruction({
    programId,
    keys,
    data,
  })
  return ix
}
