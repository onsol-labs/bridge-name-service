import { ethers_contracts } from "@certusone/wormhole-sdk";
import { ethers } from "ethers";
import { arrayify, formatUnits } from "ethers/lib/utils";
import {
  createNFTParsedTokenAccount,
  createParsedTokenAccount,
} from "../hooks/useGetSourceParsedTokenAccounts";

//This is a valuable intermediate step to the parsed token account, as the token has metadata information on it.
export async function getEthereumToken(
  tokenAddress: string,
  provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider
) {
  const token = ethers_contracts.TokenImplementation__factory.connect(
    tokenAddress,
    provider
  );
  return token;
}

export async function ethTokenToParsedTokenAccount(
  token: ethers_contracts.TokenImplementation,
  signerAddress: string
) {
  const decimals = await token.decimals();
  const balance = await token.balanceOf(signerAddress);
  const symbol = await token.symbol();
  const name = await token.name();
  return createParsedTokenAccount(
    signerAddress,
    token.address,
    balance.toString(),
    decimals,
    Number(formatUnits(balance, decimals)),
    formatUnits(balance, decimals),
    symbol,
    name
  );
}

//This is a valuable intermediate step to the parsed token account, as the token has metadata information on it.
export async function getEthereumNFT(
  tokenAddress: string,
  provider: ethers.providers.Web3Provider
) {
  const token = ethers_contracts.NFTImplementation__factory.connect(
    tokenAddress,
    provider
  );
  return token;
}

export async function isNFT(token: ethers_contracts.NFTImplementation) {
  const erc721 = "0x80ac58cd";
  const erc721metadata = "0x5b5e139f";
  const supportsErc721 = await token.supportsInterface(arrayify(erc721));
  const supportsErc721Metadata = await token.supportsInterface(
    arrayify(erc721metadata)
  );
  return supportsErc721 && supportsErc721Metadata;
}

export async function ethNFTToNFTParsedTokenAccount(
  token: ethers_contracts.NFTImplementation,
  tokenId: string,
  signerAddress: string,
  name: string,
  uri: string,
  symbol: string,
) {
  const decimals = 0;
  const balance = (await token.ownerOf(tokenId)) === signerAddress ? 1 : 0;
  // does not exist in the contract
  // https://etherscan.io/address/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85#readContract
  // const symbol2 = await token.symbol();
  // const name2 = await token.name();
  // const uri2 = await token.tokenURI(tokenId);
  return createNFTParsedTokenAccount(
    signerAddress,
    token.address,
    balance.toString(),
    decimals,
    Number(formatUnits(balance, decimals)),
    formatUnits(balance, decimals),
    tokenId,
    symbol,
    name,
    uri
  );
}

export function isValidEthereumAddress(address: string) {
  return ethers.utils.isAddress(address);
}
