import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  isEVMChain,
  nativeToHexString,
} from "@certusone/wormhole-sdk";
import {
  Card,
  CircularProgress,
  Container,
  MenuItem,
  TextField,
  Typography,
  Box
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { useCallback, useMemo, useState } from "react";
import useFetchForeignAsset, {
  ForeignAssetInfo,
} from "../hooks/useFetchForeignAsset";
import useIsWalletReady from "../hooks/useIsWalletReady";
import useMetadata from "../hooks/useMetadata";
import useOriginalAsset, { OriginalAssetInfo } from "../hooks/useOriginalAsset";
import { CHAINS, CHAINS_BY_ID } from "../utils/consts";
import HeaderText from "./HeaderText";
import KeyAndBalance from "./KeyAndBalance";
import SmartAddress from "./SmartAddress";
import { RegisterNowButtonCore } from "./Transfer/RegisterNowButton";

function PrimaryAssetInformation({
  lookupChain,
  lookupAsset,
  originChain,
  originAsset,
}: {
  lookupChain: ChainId;
  lookupAsset: string;
  originChain: ChainId;
  originAsset: string;
  showLoader: boolean;
}) {
  const tokenArray = useMemo(() => [originAsset], [originAsset]);
  const metadata = useMetadata(originChain, tokenArray);
  console.log("metadata", metadata, originChain, tokenArray);

  const nativeContent = (
    <div>
      <Typography>{`This is not a wrapped asset.`}</Typography>
    </div>
  );
  const wrapped = (
    <div>
      <Typography>{`This is a wrapped asset! Here is the original token: `}</Typography>
      <Box sx={(theme) => ({
        display: "flex",
        width: "100%",
        justifyContent: "center",
        "& > *": {
          margin: theme.spacing(2),
        },
      })}>
        <Typography>{`Chain: ${CHAINS_BY_ID[originChain].name}`}</Typography>
        <div>
          <Typography component="div">
            {"Token: "}
            <SmartAddress
              address={originAsset}
              chainId={originChain}
              symbol={metadata.data?.get(originAsset)?.symbol}
              tokenName={metadata.data?.get(originAsset)?.tokenName}
              isAsset
            />
          </Typography>
        </div>
      </Box>
    </div>
  );
  return lookupChain === originChain ? nativeContent : wrapped;
}

function SecondaryAssetInformation({
  chainId,
  foreignAssetInfo,
  originAssetInfo,
}: {
  chainId: ChainId;
  foreignAssetInfo?: ForeignAssetInfo;
  originAssetInfo?: OriginalAssetInfo;
}) {
  const tokenArray: string[] = useMemo(() => {
    //Saved to a variable to help typescript cope
    const originAddress = originAssetInfo?.originAddress;
    return originAddress && chainId === originAssetInfo?.originChain
      ? [originAddress]
      : foreignAssetInfo?.address
        ? [foreignAssetInfo?.address]
        : [];
  }, [foreignAssetInfo, originAssetInfo, chainId]);
  const metadata = useMetadata(chainId, tokenArray);
  console.log("metadata", metadata, chainId, tokenArray);

  //TODO when this is the origin chain
  return !originAssetInfo ? null : chainId === originAssetInfo.originChain ? (
    <div>
      <Typography>{`Transferring to ${CHAINS_BY_ID[chainId].name} will unwrap the token:`}</Typography>
      <Box sx={(theme) => ({ margin: theme.spacing(2) })}>
        <SmartAddress
          chainId={chainId}
          address={originAssetInfo.originAddress || undefined}
          symbol={
            metadata.data?.get(originAssetInfo.originAddress || "")?.symbol ||
            undefined
          }
          tokenName={
            metadata.data?.get(originAssetInfo.originAddress || "")
              ?.tokenName || undefined
          }
          isAsset
        />
      </Box>
    </div>
  ) : !foreignAssetInfo ? null : foreignAssetInfo.doesExist === false ? (
    <div>
      <Typography>{`This token has not yet been registered on ${CHAINS_BY_ID[chainId].name}`}</Typography>
      <RegisterNowButtonCore
        originChain={originAssetInfo?.originChain || undefined}
        originAsset={
          nativeToHexString(
            originAssetInfo?.originAddress || undefined,
            originAssetInfo?.originChain || CHAIN_ID_SOLANA // this should exist
          ) || undefined
        }
        forceAsset={
          undefined
        }
        targetChain={chainId}
      />
    </div>
  ) : (
    <div>
      <Typography>When bridged, this asset becomes: </Typography>
      <Box sx={(theme) => ({ margin: theme.spacing(2) })}>
        <SmartAddress
          chainId={chainId}
          address={foreignAssetInfo.address || undefined}
          symbol={
            metadata.data?.get(foreignAssetInfo.address || "")?.symbol ||
            undefined
          }
          tokenName={
            metadata.data?.get(foreignAssetInfo.address || "")?.tokenName ||
            undefined
          }
          isAsset
        />
      </Box>
    </div >
  );
}

export default function TokenOriginVerifier() {

  const [primaryLookupChain, setPrimaryLookupChain] = useState(CHAIN_ID_SOLANA);
  const [primaryLookupAsset, setPrimaryLookupAsset] = useState("");

  const [secondaryLookupChain, setSecondaryLookupChain] =
    useState<ChainId>(CHAIN_ID_ETH);

  const primaryLookupChainOptions = CHAINS;
  const secondaryLookupChainOptions = useMemo(
    () => CHAINS.filter((x) => x.id !== primaryLookupChain),
    [primaryLookupChain]
  );

  const handlePrimaryLookupChainChange = useCallback(
    (e: any) => {
      setPrimaryLookupChain(e.target.value);
      if (secondaryLookupChain === e.target.value) {
        setSecondaryLookupChain(
          e.target.value === CHAIN_ID_SOLANA ? CHAIN_ID_ETH : CHAIN_ID_SOLANA
        );
      }
      setPrimaryLookupAsset("");
    },
    [secondaryLookupChain]
  );
  const handleSecondaryLookupChainChange = useCallback((e: any) => {
    setSecondaryLookupChain(e.target.value);
  }, []);
  const handlePrimaryLookupAssetChange = useCallback((event: any) => {
    setPrimaryLookupAsset(event.target.value);
  }, []);

  const originInfo = useOriginalAsset(
    primaryLookupChain,
    primaryLookupAsset,
    false
  );
  console.log("OI", originInfo);
  const foreignAssetInfo = useFetchForeignAsset(
    originInfo.data?.originChain || 1,
    originInfo.data?.originAddress || "",
    secondaryLookupChain
  );

  const primaryWalletIsActive = !originInfo.data;
  const secondaryWalletIsActive = !primaryWalletIsActive;

  const primaryWallet = useIsWalletReady(
    primaryLookupChain,
    primaryWalletIsActive
  );
  const secondaryWallet = useIsWalletReady(
    secondaryLookupChain,
    secondaryWalletIsActive
  );

  const primaryWalletError =
    isEVMChain(primaryLookupChain) &&
    primaryLookupAsset &&
    !originInfo.data &&
    !originInfo.error &&
    (!primaryWallet.isReady ? primaryWallet.statusMessage : "");
  const originError = originInfo.error;
  const primaryError = primaryWalletError || originError;

  const secondaryWalletError =
    isEVMChain(secondaryLookupChain) &&
    originInfo.data?.originAddress &&
    originInfo.data?.originChain &&
    !foreignAssetInfo.data &&
    (!secondaryWallet.isReady ? secondaryWallet.statusMessage : "");
  const foreignError = foreignAssetInfo.error;
  const secondaryError = secondaryWalletError || foreignError;

  const primaryContent = (
    <>
      <Typography variant="h5">Source Information</Typography>
      <Typography variant="body1" color="textSecondary">
        Enter a token from any supported chain to get started.
      </Typography>
      <Box sx={(theme) => ({ height: theme.spacing(3) })} />
      <TextField
        select
        variant="outlined"
        label="Chain"
        value={primaryLookupChain}
        onChange={handlePrimaryLookupChainChange}
        fullWidth
        margin="normal"
      >
        {primaryLookupChainOptions.map(({ id, name }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        variant="outlined"
        margin="normal"
        label="Paste an address"
        value={primaryLookupAsset}
        onChange={handlePrimaryLookupAssetChange}
      />
      <Box sx={{ textAlign: "center" }}>
        {isEVMChain(primaryLookupChain) ? (
          <KeyAndBalance chainId={primaryLookupChain} />
        ) : null}
        {primaryError ? (
          <Typography color="error">{primaryError}</Typography>
        ) : null}
        <Box sx={(theme) => ({ height: theme.spacing(3) })} />
        {originInfo.isFetching ? (
          <CircularProgress />
        ) : originInfo.data?.originChain && originInfo.data.originAddress ? (
          <PrimaryAssetInformation
            lookupAsset={primaryLookupAsset}
            lookupChain={primaryLookupChain}
            originChain={originInfo.data.originChain}
            originAsset={originInfo.data.originAddress}
            showLoader={originInfo.isFetching}
          />
        ) : null}
      </Box>
    </>
  );

  const secondaryContent = originInfo.data ? (
    <>
      <Typography variant="h5">Bridge Results</Typography>
      <Typography variant="body1" color="textSecondary">
        Select a chain to see the result of bridging this token.
      </Typography>
      <Box sx={(theme) => ({ height: theme.spacing(3) })} />
      <TextField
        select
        variant="outlined"
        label="Other Chain"
        value={secondaryLookupChain}
        onChange={handleSecondaryLookupChainChange}
        fullWidth
        margin="normal"
      >
        {secondaryLookupChainOptions.map(({ id, name }) => (
          <MenuItem key={id} value={id}>
            {name}
          </MenuItem>
        ))}
      </TextField>
      <Box sx={{ textAlign: "center" }}>
        {isEVMChain(secondaryLookupChain) ? (
          <KeyAndBalance chainId={secondaryLookupChain} />
        ) : null}
        {secondaryError ? (
          <Typography color="error">{secondaryError}</Typography>
        ) : null}
        <Box sx={(theme) => ({ height: theme.spacing(3) })} />
        {foreignAssetInfo.isFetching ? (
          <CircularProgress />
        ) : originInfo.data?.originChain && originInfo.data.originAddress ? (
          <SecondaryAssetInformation
            foreignAssetInfo={foreignAssetInfo.data || undefined}
            originAssetInfo={originInfo.data || undefined}
            chainId={secondaryLookupChain}
          />
        ) : null}
      </Box>
    </>
  ) : null;

  const content = (
    <div>
      <Container maxWidth="md" sx={{ textAlign: "center" }}>
        <HeaderText white>Token Origin Verifier</HeaderText>
      </Container>
      <Container maxWidth="sm">
        <Card sx={{ padding: "32px 32px 16px" }}>{primaryContent}</Card>
        {secondaryContent ? (
          <>
            <Box sx={{ textAlign: "center" }}>
              <ArrowDropDownIcon sx={{
                margin: "0 auto",
                fontSize: "70px",
              }} />
            </Box>
            <Card sx={{ padding: "32px 32px 16px" }}>{secondaryContent}</Card>
          </>
        ) : null}
      </Container>
    </div>
  );

  return content;
}
