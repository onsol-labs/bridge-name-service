import axios from 'axios';
import { createWrapDomainInstruction, WrapDomainInstructionAccounts, WrapDomainInstructionArgs } from './bridge-name-service/generated/instructions/wrapDomain';
import { findNameHouse, findRenewableMintAddress, findTldHouse, findTldState, findTldTreasuryManager, getAtaForMint, getHashedName, getMasterEdition, getMetadata, getNameAccountKey, getParentNameKeyWithBump, mintAnsNft } from './utils/name_house';
import * as config from "./config";
import { Connection, PublicKey, ComputeBudgetProgram, TransactionInstruction } from '@solana/web3.js';
import { ANS_PROGRAM_ID, ENS_ON_ETH, SOLANA_NATIVE_MINT, TLD_HOUSE_PROGRAM_ID } from './constants';
import { findBNSVault, getWormholeMintAccountFromTokenId, NameRecordHeaderRaw } from './utils/bridgeNameService';


export interface PreparedInstructionWrapDomain {
  instructions: TransactionInstruction[];
  domainName: string;
}

export async function wrapDomain(
  connection: Connection,
  tokenId: string,
  payerAddress: PublicKey,
): Promise<PreparedInstructionWrapDomain> {
  const [tldState] = await findTldState();
  const [tldHouse, thBump] = findTldHouse(config.TLD);

  const [bnsVault] = findBNSVault();

  const [treasuryManager] = findTldTreasuryManager(config.TLD);
  const ensMetadataUri = `https://metadata.ens.domains/${config.ETH_ENVIRONMENT}/${ENS_ON_ETH}/${tokenId}`
  const offChainMetadata = await axios.get(ensMetadataUri);
  const parts = offChainMetadata.data['name'].split(config.TLD);
  const domainName = parts[0];
  // console.log(domainName, tokenId)
  tokenId = tokenId.substring(2);
  const bnsMint = getWormholeMintAccountFromTokenId(tokenId)
  const [parentNameKey, parentBump] = await getParentNameKeyWithBump(config.TLD);
  const hashedDomainName = await getHashedName(domainName);
  const [nameAccount] = await getNameAccountKey(
    hashedDomainName,
    undefined,
    parentNameKey,
  );

  const nameAccountCreated = await NameRecordHeaderRaw.fromAccountAddress(connection, nameAccount)
  if (nameAccountCreated) return { instructions: [], domainName: domainName }
  const attribuesLen = offChainMetadata.data['attributes'].length
  // console.log(offChainMetadata)
  // the value below needs to be taken from the nft metadata.
  let mainExpirationDate = offChainMetadata.data['attributes'][attribuesLen - 1]['value'];
  const minDuration: number = 864000000; // 10 days in milliseconds
  const expirationFromNow = mainExpirationDate - Date.now();
  // console.log(expirationFromNow)
  const durationRate: number = Math.ceil(expirationFromNow / minDuration);

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
    owner: payerAddress,
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
      payerAddress,
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

  const setComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
    units: 300000,
  });
  return { instructions: [setComputeUnits, wrapBNStoANSIX], domainName }
}

export async function createNftAns(connection: Connection, domainName: string, payerAddress: PublicKey) {
  const [tldHouse] = findTldHouse(config.TLD);
  const [nameHouseAccount] = findNameHouse(tldHouse);
  const [parentNameKey] = await getParentNameKeyWithBump(config.TLD);
  const hashedDomainName = await getHashedName(domainName);
  const [nameAccount] = await getNameAccountKey(
    hashedDomainName,
    undefined,
    parentNameKey,
  );

  const nameAccountCreated = await NameRecordHeaderRaw.fromAccountAddress(connection, nameAccount)
  // console.log(nameAccountCreated?.expiresAt)
  const [mintAccountCreated, mintBump] = findRenewableMintAddress(
    nameAccount,
    nameHouseAccount,
    nameAccountCreated?.expiresAtBuffer!,
  );
  const mintNftIxs = await mintAnsNft(domainName, payerAddress, config.TLD, mintAccountCreated, mintBump);
  if (!mintNftIxs) throw new Error("Could not create mintNftIxs");

  const instructions: TransactionInstruction[] = [];
  instructions.push(ComputeBudgetProgram.setComputeUnitLimit({
    units: 1200000,
  }), ...mintNftIxs)
  return instructions
}
