import axios from 'axios';
import { Transaction } from '@solana/web3.js';
import { BigNumber } from '@ethersproject/bignumber';
import { BinaryReader } from 'borsh';
import { createWrapDomainInstruction, WrapDomainInstructionAccounts, WrapDomainInstructionArgs } from './generated/instructions/wrapDomain';
import { findCollectionMint, findNameHouse, findNameRecord, findRenewableMintAddress, findTldHouse, findTldState, findTldTreasuryManager, getAtaForMint, getHashedName, getMasterEdition, getMetadata, getNameAccountKey, getParentNameKeyWithBump, mintAnsNft } from './utils/name_house';
import * as config from "./config";
import { Connection, PublicKey, SYSVAR_INSTRUCTIONS_PUBKEY, ComputeBudgetProgram, Keypair, VersionedTransaction, TransactionMessage, TransactionInstruction, AddressLookupTableProgram } from '@solana/web3.js';
import { ANS_PROGRAM_ID, NAME_HOUSE_PROGRAM_ID, SOLANA_NATIVE_MINT, TLD_HOUSE_PROGRAM_ID, TOKEN_METADATA_PROGRAM_ID } from './constants';
import { findBNSVault, getWormholeMintAccount, NameRecordHeaderRaw } from './utils/bridgeNameService';


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
  // const lookupTable = (await connection.getAddressLookupTable(config.LOOKUP_TABLE_BNS))
  //   .value;
  let latestBlockhash = await connection.getLatestBlockhash();
  // const messageV0 = new TransactionMessage({
  //   payerKey: feePayer.publicKey,
  //   recentBlockhash: latestBlockhash.blockhash,
  //   instructions,
  // }).compileToV0Message([lookupTable]);
  // const tx = new VersionedTransaction(messageV0);
  const tx = new Transaction({
    recentBlockhash: latestBlockhash.blockhash,
  }).add(...instructions)
  tx.sign(signers[0]);
  const tx_id2 = await connection.simulateTransaction(tx, signers)
  console.log(tx_id2.value.logs.forEach(log => console.log(log)))
  const tx_id = await connection.sendRawTransaction(tx.serialize(), { skipPreflight: false });
  if (confirmIt) {
    await connection.confirmTransaction({
      signature: tx_id,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      blockhash: latestBlockhash.blockhash,
    }, "finalized");
  }
  return tx_id;
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

  let domainName = 'bridgenameservice';
  const [parentNameKey, parentBump] = await getParentNameKeyWithBump(config.TLD);
  console.log(parentNameKey.toBase58())
  const hashedDomainName = await getHashedName(domainName);
  const [nameAccount, nameAccountBump] = await getNameAccountKey(
    hashedDomainName,
    undefined,
    parentNameKey,
  );
  const [bnsMint, hexedTokenId] = getWormholeMintAccount(domainName)
  const ensMetadataUri = `https://metadata.ens.domains/goerli/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/0x${hexedTokenId}`
  const offChainMetadata = await axios.get(ensMetadataUri);
  const attribuesLen = offChainMetadata.data['attributes'].length
  // console.log(offChainMetadata)
  // the value below needs to be taken from the nft metadata.
  let mainExpirationDate = offChainMetadata.data['attributes'][attribuesLen - 1]['value'];
  const minDuration: number = 864000000; // 1 year in seconds
  const expirationFromNow = mainExpirationDate - Date.now();
  // console.log(expirationFromNow)
  const durationRate: number = Math.ceil(expirationFromNow / minDuration);

  // console.log(durationRate)
  const expiresAt = (minDuration * durationRate) + Date.now();
  console.log(Math.floor((expiresAt) / 1000))
  const expiresAtBuffer = Buffer.alloc(8);
  expiresAtBuffer.writeBigInt64LE(BigNumber.from((Math.floor((expiresAt / 1000)))).toBigInt());

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
    nameClassAccount: PublicKey.default,
    nameParentAccount: parentNameKey,
    tldHouseProgram: TLD_HOUSE_PROGRAM_ID,
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

  const setComputUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 1200000,
  });
  const tx_id = await signAndSendTransactionInstructionsModified(
    connection,
    [config.NAME_TOKENIZER_BUYER_KEYPAIR],
    config.NAME_TOKENIZER_BUYER_KEYPAIR,
    [setComputUnits, wrapBNStoANSIX],
    true,
  );
  console.log(tx_id);
  console.log(`https://solscan.io/tx/${tx_id}?cluster=devnet`);
  const nameAccountCreated = await NameRecordHeaderRaw.fromAccountAddress(connection, nameAccount)
  console.log(nameAccountCreated.expiresAt)
  const [mintAccountCreated, mintBump] = findRenewableMintAddress(
    nameAccount,
    nameHouseAccount,
    nameAccountCreated.expiresAtBuffer,
  );
  const mintNftIxs = await mintAnsNft(domainName, config.NAME_TOKENIZER_BUYER_KEYPAIR.publicKey, config.TLD, mintAccountCreated, mintBump);
  const tx_id2 = await signAndSendTransactionInstructionsModified(
    connection,
    [config.NAME_TOKENIZER_BUYER_KEYPAIR],
    config.NAME_TOKENIZER_BUYER_KEYPAIR,
    [setComputUnits, ...mintNftIxs],
  );
  console.log(tx_id2);
  console.log(`https://solscan.io/tx/${tx_id2}?cluster=devnet`);
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

