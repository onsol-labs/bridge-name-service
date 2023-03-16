import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  hexToNativeAssetString,
  isEVMChain,
  uint8ArrayToHex,
} from "@certusone/wormhole-sdk";
import {
  getOriginalAssetEth,
  getOriginalAssetSol,
  WormholeWrappedNFTInfo,
} from "@certusone/wormhole-sdk/lib/esm/nft_bridge";
import {
  Button,
  Card,
  CircularProgress,
  Container,
  MenuItem,
  TextField,
  Typography,
  Box
} from "@mui/material";
import { Launch } from "@mui/icons-material";
import { Alert } from "@mui/material";
import { Connection } from "@solana/web3.js";
import { useCallback, useEffect, useState } from "react";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import useIsWalletReady from "../hooks/useIsWalletReady";
import { getMetaplexData } from "../hooks/useMetaplexData";
import { NFTParsedTokenAccount } from "../store/nftSlice";
import {
  CHAINS_BY_ID,
  CHAINS_WITH_NFT_SUPPORT,
  getNFTBridgeAddressForChain,
  SOLANA_HOST,
  SOL_NFT_BRIDGE_ADDRESS,
} from "../utils/consts";
import {
  ethNFTToNFTParsedTokenAccount,
  getEthereumNFT,
  isNFT,
  isValidEthereumAddress,
} from "../utils/ethereum";
import HeaderText from "./HeaderText";
import KeyAndBalance from "./KeyAndBalance";
import NFTViewer from "./TokenSelectors/NFTViewer";

export default function NFTOriginVerifier() {
  const { provider, signerAddress } = useEthereumProvider();
  const [lookupChain, setLookupChain] = useState<ChainId>(CHAIN_ID_ETH);
  const { isReady, statusMessage } = useIsWalletReady(lookupChain);
  const [lookupAsset, setLookupAsset] = useState("");
  const [lookupTokenId, setLookupTokenId] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [parsedTokenAccount, setParsedTokenAccount] = useState<
    NFTParsedTokenAccount | undefined
  >(undefined);
  const [originInfo, setOriginInfo] = useState<
    WormholeWrappedNFTInfo | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const handleChainChange = useCallback((event: any) => {
    setLookupChain(event.target.value);
  }, []);
  const handleAssetChange = useCallback((event: any) => {
    setLookupAsset(event.target.value);
  }, []);
  const handleTokenIdChange = useCallback((event: any) => {
    setLookupTokenId(event.target.value);
  }, []);
  useEffect(() => {
    let cancelled = false;
    setLookupError("");
    setParsedTokenAccount(undefined);
    setOriginInfo(undefined);
    if (
      isReady &&
      provider &&
      signerAddress &&
      isEVMChain(lookupChain) &&
      lookupAsset &&
      lookupTokenId
    ) {
      if (isValidEthereumAddress(lookupAsset)) {
        (async () => {
          setIsLoading(true);
          try {
            const token = await getEthereumNFT(lookupAsset, provider);
            const result = await isNFT(token);
            if (result) {
              const newParsedTokenAccount = await ethNFTToNFTParsedTokenAccount(
                token,
                lookupTokenId,
                signerAddress,
                "null",
                "null",
                "null"
              );
              const info = await getOriginalAssetEth(
                getNFTBridgeAddressForChain(lookupChain),
                provider,
                lookupAsset,
                lookupTokenId,
                lookupChain
              );
              if (!cancelled) {
                setIsLoading(false);
                setParsedTokenAccount(newParsedTokenAccount);
                setOriginInfo(info);
              }
            } else if (!cancelled) {
              setIsLoading(false);
              setLookupError(
                "This token does not support ERC-165, ERC-721, and ERC-721 metadata"
              );
            }
          } catch (e) {
            console.error(e);
            if (!cancelled) {
              setIsLoading(false);
              setLookupError(
                "This token does not support ERC-165, ERC-721, and ERC-721 metadata"
              );
            }
          }
        })();
      } else {
        setLookupError("Invalid address");
      }
    } else if (lookupChain === CHAIN_ID_SOLANA && lookupAsset) {
      (async () => {
        try {
          setIsLoading(true);
          const [metadata] = await getMetaplexData([lookupAsset]);
          if (metadata) {
            const connection = new Connection(SOLANA_HOST, "confirmed");
            const info = await getOriginalAssetSol(
              connection,
              SOL_NFT_BRIDGE_ADDRESS,
              lookupAsset
            );
            if (!cancelled) {
              setIsLoading(false);
              setParsedTokenAccount({
                amount: "0",
                decimals: 0,
                mintKey: lookupAsset,
                publicKey: "",
                uiAmount: 0,
                uiAmountString: "0",
                uri: metadata.data.uri,
              });
              setOriginInfo(info);
            }
          } else {
            if (!cancelled) {
              setIsLoading(false);
              setLookupError("Error fetching metadata");
            }
          }
        } catch (e) {
          console.error(e);
          if (!cancelled) {
            setIsLoading(false);
            setLookupError("Invalid token");
          }
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [
    isReady,
    provider,
    signerAddress,
    lookupChain,
    lookupAsset,
    lookupTokenId,
  ]);
  const readableAddress =
    originInfo &&
    originInfo.chainId &&
    originInfo.assetAddress &&
    hexToNativeAssetString(
      uint8ArrayToHex(originInfo.assetAddress),
      originInfo.chainId
    );
  const displayError =
    (isEVMChain(lookupChain) && statusMessage) || lookupError;
  return (
    <div>
      <Container maxWidth="md">
        <HeaderText white>NFT Origin Verifier</HeaderText>
      </Container>
      <Container maxWidth="sm">
        <Card sx={{
          padding: "32px",
        }}>
          <Alert severity="info" variant="outlined">
            This page allows you to find where a Wormhole-bridged NFT was
            originally minted so you can verify its authenticity.
          </Alert>
          <TextField
            select
            variant="outlined"
            label="Chain"
            value={lookupChain}
            onChange={handleChainChange}
            fullWidth
            margin="normal"
          >
            {CHAINS_WITH_NFT_SUPPORT.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>
          {isEVMChain(lookupChain) ? (
            <KeyAndBalance chainId={lookupChain} />
          ) : null}
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Paste an address"
            value={lookupAsset}
            onChange={handleAssetChange}
          />
          {isEVMChain(lookupChain) ? (
            <TextField
              fullWidth
              variant="outlined"
              margin="normal"
              label="Paste a tokenId"
              value={lookupTokenId}
              onChange={handleTokenIdChange}
            />
          ) : null}
          {displayError ? (
            <Typography align="center" color="error">
              {displayError}
            </Typography>
          ) : null}
          {isLoading ? (
            <Box sx={{
              margin: 1,
              textAlign: "center"
            }}>
              <CircularProgress />
            </Box>
          ) : null}
          {parsedTokenAccount ? (
            <NFTViewer value={parsedTokenAccount} chainId={lookupChain} />
          ) : null}
          {originInfo ? (
            <>
              <Typography
                variant="h5"
                gutterBottom
                sx={{
                  marginTop: 4,
                }}
              >
                Origin Info
              </Typography>
              <Typography variant="body2" gutterBottom>
                Chain: {CHAINS_BY_ID[originInfo.chainId].name}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Address: {readableAddress}
              </Typography>
              {originInfo.chainId === CHAIN_ID_SOLANA ? null : (
                <Typography variant="body2" gutterBottom>
                  Token ID: {originInfo.tokenId}
                </Typography>
              )}
              <Box sx={{
                textAlign: "center",
              }}>
                {originInfo.chainId === CHAIN_ID_SOLANA ? (
                  <Button
                    href={`https://solscan.io/token/${readableAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Launch />}
                    sx={{ marginTop: 1 }}
                    variant="outlined"
                  >
                    View on Solscan
                  </Button>
                ) : (
                  <Button
                    href={`https://opensea.io/assets/${readableAddress}/${originInfo.tokenId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<Launch />}
                    sx={{ marginTop: 1 }}
                    variant="outlined"
                  >
                    View on OpenSea
                  </Button>
                )}
              </Box>
            </>
          ) : null}
        </Card>
      </Container>
    </div >
  );
}
