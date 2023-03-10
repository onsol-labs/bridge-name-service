import { BigNumber } from '@ethersproject/bignumber';
import { BinaryReader } from 'borsh';
import { createWrapDomainInstruction, WrapDomainInstructionAccounts, WrapDomainInstructionArgs } from './generated/instructions/wrapDomain';
import { findCollectionMint, findNameHouse, findNameRecord, findRenewableMintAddress, findTldHouse, findTldState, findTldTreasuryManager, getAtaForMint, getHashedName, getMasterEdition, getMetadata, getNameAccountKey, getParentNameKeyWithBump } from './utils/name_house';
import * as config from "./config";
import { Connection, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, ComputeBudgetProgram, Keypair, VersionedTransaction, TransactionMessage, TransactionInstruction, AddressLookupTableProgram } from '@solana/web3.js';
import { ANS_PROGRAM_ID, NAME_HOUSE_PROGRAM_ID, SOLANA_NATIVE_MINT, TLD_HOUSE_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from './constants';
import { findBNSVault, getWormholeMintAccount } from './utils/bridgeNameService';
import { BN } from 'bn.js';
import { createCreateNftAnsInstruction, CreateNftAnsInstructionAccounts, CreateNftAnsInstructionArgs } from './generated';


async function createLookupTable() {
  // Step 1 - Get a lookup table address and create lookup table instruction
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
      payer: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
      recentSlot: (await config.CONNECTION.getSlot()) - 300,
    });

  // Step 2 - Log Lookup Table Address
  console.log("Lookup Table Address:", lookupTableAddress.toBase58());

  const tx_id = await signAndSendTransactionInstructionsModified(
    config.CONNECTION,
    [config.NAME_TOKENIZER_BUYER_KEYPAIR],
    config.NAME_TOKENIZER_BUYER_KEYPAIR,
    [lookupTableInst],
    true,
  );
  console.log(`https://solscan.io/tx/${tx_id}?cluster=devnet`);
  return lookupTableAddress;
}

async function addAddressesToTable(
  publicKeys: PublicKey[],
) {
  // Step 1 - Create Transaction Instruction
  // console.log(publicKeys.map((key) => key.toBase58()))
  const addAddressesInstruction = AddressLookupTableProgram.extendLookupTable(
    {
      payer: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
      authority: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
      lookupTable: config.LOOKUP_TABLE_BNS,
      addresses: publicKeys,
    },
  );
  // Step 2 - Generate a transaction and send it to the network
  const tx_id = await signAndSendTransactionInstructionsModified(
    config.CONNECTION,
    [config.NAME_TOKENIZER_BUYER_KEYPAIR],
    config.NAME_TOKENIZER_BUYER_KEYPAIR,
    [addAddressesInstruction],
  );
  console.log(`https://solscan.io/tx/${tx_id}?cluster=devnet`);
  // console.log(LUTAddress)
}

// updated to use the latest solana versioned transaction
export const signAndSendTransactionInstructionsModified = async (
  // sign and send transaction
  connection: Connection,
  signers: Keypair[],
  feePayer: Keypair,
  instructions: TransactionInstruction[],
  confirmIt?: boolean,
  // ): Promise<string> => {
) => {
  const lookupTable = (await connection.getAddressLookupTable(config.LOOKUP_TABLE_BNS))
    .value;
  let latestBlockhash = await connection.getLatestBlockhash();
  const messageV0 = new TransactionMessage({
    payerKey: feePayer.publicKey,
    recentBlockhash: latestBlockhash.blockhash,
    instructions,
  }).compileToV0Message([lookupTable]);
  const tx = new VersionedTransaction(messageV0);
  tx.sign(signers);
  const tx_id2 = await connection.simulateTransaction(tx, { minContextSlot: (await config.CONNECTION.getSlot()) })
  console.log(tx_id2.value.logs.forEach(log => console.log(log)))
  // const tx_id = await connection.sendTransaction(tx, { skipPreflight: false });
  // if (confirmIt) {
  //   await connection.confirmTransaction({
  //     signature: tx_id,
  //     lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  //     blockhash: latestBlockhash.blockhash,
  //   }, "confirmed");
  // }
  // return tx_id;
};


async function wrapDomain(
  connection: Connection = config.CONNECTION,
) {
  const [tldState] = await findTldState();
  // console.log(tldState.toBase58())
  const [tldHouse, thBump] = findTldHouse(config.TLD);
  // console.log(tldHouse.toBase58())

  const [bnsVault] = findBNSVault();
  // console.log(bnsVault.toBase58())

  const [nameHouseAccount] = findNameHouse(tldHouse);
  // console.log(nameHouseAccount.toBase58())

  const [treasuryManager] = findTldTreasuryManager(config.TLD);
  // console.log(treasuryManager.toBase58());

  const [collectionMintAccount] = findCollectionMint(tldHouse);
  // console.log(collectionMintAccount.toBase58())
  let domainName = 'onsol';
  const [parentNameKey, parentBump] = await getParentNameKeyWithBump(config.TLD);
  // console.log(parentNameKey.toBase58())
  const hashedDomainName = await getHashedName(domainName);
  const [nameAccount, nameAccountBump] = await getNameAccountKey(
    hashedDomainName,
    undefined,
    parentNameKey,
  );
  const [bnsMint] = getWormholeMintAccount(domainName)


  let mainExpirationDate = 1709726556000;
  const minDuration: number = 864000000; // 1 year in seconds
  const expirationFromNow = mainExpirationDate - Date.now();
  // console.log(expirationFromNow)
  const durationRate: number = Math.ceil(expirationFromNow / minDuration);

  // console.log(durationRate)
  const expiresAt = (minDuration * durationRate) + Date.now();
  console.log(Math.floor((expiresAt) / 1000) - 12)
  const expiresAtBuffer = Buffer.alloc(8);
  expiresAtBuffer.writeBigInt64LE(BigNumber.from((Math.floor((expiresAt / 1000)) - 12)).toBigInt());


  const [mintAccount, mintBump] = findRenewableMintAddress(
    nameAccount,
    nameHouseAccount,
    expiresAtBuffer,
  );

  const mintAtaAccount = getAtaForMint(
    mintAccount,
    config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
  )[0];

  const [nftRecord] = findNameRecord(
    nameAccount,
    nameHouseAccount,
  );
  const reverseHashedName = await getHashedName(nameAccount.toBase58());
  const [reverseNameAccount] = await getNameAccountKey(
    reverseHashedName,
    tldHouse,
  );

  let wrapDomainInstructionArgs: WrapDomainInstructionArgs = {
    tld: config.TLD,
    hashedName: hashedDomainName,
    reverseAccHashedName: reverseHashedName,
    name: domainName,
    space: 100,
    thBump: thBump,
    nameParentBump: parentBump,
    durationRate: durationRate,
    mintBump: mintBump,
  }

  let wrapDomainInstructionAccounts: WrapDomainInstructionAccounts = {
    owner: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
    bnsVault: bnsVault,
    vaultAtaAccount: getAtaForMint(
      bnsMint,
      bnsVault,
    )[0],
    tldState: tldState,
    tldHouse: tldHouse,
    treasuryManager: treasuryManager,
    authority: config.TLD_HOUSE_AUTHORITY,
    paymentTokenMint: SOLANA_NATIVE_MINT,
    nameAccount: nameAccount,
    reverseNameAccount: reverseNameAccount,
    bnsMintAccount: bnsMint,
    bnsMintAtaAccount: getAtaForMint(
      bnsMint,
      config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
    )[0],
    ansMintAccount: mintAccount,
    nameClassAccount: PublicKey.default,
    nameParentAccount: parentNameKey,
    nameHouseAccount: nameHouseAccount,
    tldHouseProgram: TLD_HOUSE_PROGRAM_ID,
    nameHouseProgram: NAME_HOUSE_PROGRAM_ID,
    altNameServiceProgram: ANS_PROGRAM_ID,
    anchorRemainingAccounts: [
      {
        pubkey: new PublicKey(config.TLD_HOUSE_AUTHORITY),
        isSigner: false,
        isWritable: true,
      }
    ]
  }

  const wrapBNStoANSIX = createWrapDomainInstruction(
    wrapDomainInstructionAccounts,
    wrapDomainInstructionArgs,
  );
  const createNftArgs: CreateNftAnsInstructionArgs = {
    tld: config.TLD,
    hashedName: hashedDomainName,
    reverseAccHashedName: reverseHashedName,
    name: domainName,
  }

  let createNftAnsIxAccounts: CreateNftAnsInstructionAccounts = {
    owner: config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
    tldState: tldState,
    tldHouse: tldHouse,
    paymentTokenMint: SOLANA_NATIVE_MINT,
    nameAccount: nameAccount,
    reverseNameAccount: reverseNameAccount,
    bnsMintAccount: bnsMint,
    bnsMintAtaAccount: getAtaForMint(
      bnsMint,
      config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey,
    )[0],
    ansMintAccount: mintAccount,
    nameClassAccount: PublicKey.default,
    nameParentAccount: parentNameKey,
    ansMintAtaAccount: mintAtaAccount,
    nftRecord: nftRecord,
    collectionMint: collectionMintAccount,
    collectionMetadata: getMetadata(collectionMintAccount),
    collectionMasterEditionAccount: getMasterEdition(collectionMintAccount),
    editionAccount: getMasterEdition(mintAccount),
    metadataAccount: getMetadata(mintAccount),
    nameHouseAccount: nameHouseAccount,
    tldHouseProgram: TLD_HOUSE_PROGRAM_ID,
    nameHouseProgram: NAME_HOUSE_PROGRAM_ID,
    altNameServiceProgram: ANS_PROGRAM_ID,
    tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
    instructionSysvarAccount: SYSVAR_INSTRUCTIONS_PUBKEY,
  }

  const createNftAnsIx = createCreateNftAnsInstruction(
    createNftAnsIxAccounts,
    createNftArgs,
  );
  const setComputUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1400000,
  });
  const tx_id = await signAndSendTransactionInstructionsModified(
    connection,
    [config.NAME_TOKENIZER_BUYER_KEYPAIR],
    config.NAME_TOKENIZER_BUYER_KEYPAIR,
    [setComputUnits, wrapBNStoANSIX, createNftAnsIx],
  );
  console.log(tx_id);
  console.log(`https://solscan.io/tx/${tx_id}?cluster=devnet`);

}

// createLookupTable();
// addAddressesToTable([
//   new PublicKey("6NydcCa9aoGomjcnVQut1nkaPFzKz6CPknMBx9zoRQB5"),
//   new PublicKey("DkJzwGD2VWYXcUfDAzvWfP3q2jSsJSNcrAQgTQVntKJo"),
//   new PublicKey("GqUw6MjqA9o8TNXZMEnYZdfzWgpe5FVQ8bnZqpMSCDPj"),
//   new PublicKey("9nwUf8peEstKtAyKNeKUmLhxct2WHzfb4evLG6JnbCaP"),
//   new PublicKey("595KxBJnKBD6JEu7FyHSJicbGkWnTCMixYCBjDxzrGp6"),
//   new PublicKey("BXT7pGo3DP2Ad3Ygptc66HzL4vJTRPZn2nobWJtqJYiC"),
//   new PublicKey("EzeAEs3QtU8BdbXL2AnMcP9Wbpd9YwbocqPj8hEujK6v"),
//   new PublicKey("HVQHC4DJoNaq8WVMYvwqqXLcLJzCtvfYfvu7fcN3bFGa"),
//   new PublicKey("EzeAEs3QtU8BdbXL2AnMcP9Wbpd9YwbocqPj8hEujK6v"),
//   new PublicKey("B4nDum6v4RLpyETk3MmU4rZpkZKt17PsY4bpRf46BEtN"),
//   new PublicKey("TLDhatkjchgoteyVPXkKzAvVjj25wZ6ceEtEhsDAVjK"),
//   new PublicKey("nMtokZ8bQtN2scgy7CJDc24VQWmisEuByqar27eJXmX"),
//   new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
//   new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),
//   new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
// ])
wrapDomain()

// let domainName = 'onsol';
// console.log(getWormholeMintAccount(domainName)[0].toBase58())


// in milliseconds from metadata

