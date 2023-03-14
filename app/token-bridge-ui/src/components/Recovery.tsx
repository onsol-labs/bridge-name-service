import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  getEmitterAddressEth,
  getEmitterAddressSolana,
  hexToNativeAssetString,
  hexToNativeString,
  hexToUint8Array,
  isEVMChain,
  parseNFTPayload,
  parseSequenceFromLogEth,
  parseSequenceFromLogSolana,
  parseTransferPayload,
  parseVaa,
  uint8ArrayToHex,
} from "@certusone/wormhole-sdk";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CircularProgress,
  Container,
  Divider,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { Alert } from "@mui/material";
import { Connection } from "@solana/web3.js";
import axios from "axios";
import { ethers } from "ethers";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import useIsWalletReady from "../hooks/useIsWalletReady";
import useRelayersAvailable, { Relayer } from "../hooks/useRelayersAvailable";
import { setRecoveryVaa as setRecoveryNFTVaa } from "../store/nftSlice";
import {
  CHAINS,
  CHAINS_BY_ID,
  CHAINS_WITH_NFT_SUPPORT,
  getBridgeAddressForChain,
  getNFTBridgeAddressForChain,
  getTokenBridgeAddressForChain,
  RELAY_URL_EXTENSION,
  SOLANA_HOST,
  SOL_NFT_BRIDGE_ADDRESS,
  SOL_TOKEN_BRIDGE_ADDRESS,
  WORMHOLE_RPC_HOSTS,
} from "../utils/consts";
import { getSignedVAAWithRetry } from "../utils/getSignedVAAWithRetry";
import parseError from "../utils/parseError";
import ButtonWithLoader from "./ButtonWithLoader";
import ChainSelect from "./ChainSelect";
import KeyAndBalance from "./KeyAndBalance";
import RelaySelector from "./RelaySelector";
import PendingVAAWarning from "./Transfer/PendingVAAWarning";

async function fetchSignedVAA(
  chainId: ChainId,
  emitterAddress: string,
  sequence: string
) {
  const { vaaBytes, isPending } = await getSignedVAAWithRetry(
    chainId,
    emitterAddress,
    sequence,
    WORMHOLE_RPC_HOSTS.length
  );
  return {
    vaa: vaaBytes ? uint8ArrayToHex(vaaBytes) : undefined,
    isPending,
    error: null,
  };
}

function handleError(e: any, enqueueSnackbar: any) {
  console.error(e);
  enqueueSnackbar(null, {
    content: <Alert severity="error">{parseError(e)}</Alert>,
  });
  return { vaa: null, isPending: false, error: parseError(e) };
}

async function evm(
  provider: ethers.providers.Web3Provider,
  tx: string,
  enqueueSnackbar: any,
  chainId: ChainId,
  nft: boolean
) {
  try {
    const receipt = await provider.getTransactionReceipt(tx);
    const sequence = parseSequenceFromLogEth(
      receipt,
      getBridgeAddressForChain(chainId)
    );
    const emitterAddress = getEmitterAddressEth(
      nft
        ? getNFTBridgeAddressForChain(chainId)
        : getTokenBridgeAddressForChain(chainId)
    );
    return await fetchSignedVAA(chainId, emitterAddress, sequence);
  } catch (e) {
    return handleError(e, enqueueSnackbar);
  }
}

async function solana(tx: string, enqueueSnackbar: any, nft: boolean) {
  try {
    const connection = new Connection(SOLANA_HOST, "confirmed");
    const info = await connection.getTransaction(tx);
    if (!info) {
      throw new Error("An error occurred while fetching the transaction info");
    }
    const sequence = parseSequenceFromLogSolana(info);
    const emitterAddress = await getEmitterAddressSolana(
      nft ? SOL_NFT_BRIDGE_ADDRESS : SOL_TOKEN_BRIDGE_ADDRESS
    );
    return await fetchSignedVAA(CHAIN_ID_SOLANA, emitterAddress, sequence);
  } catch (e) {
    return handleError(e, enqueueSnackbar);
  }
}

function RelayerRecovery({
  parsedPayload,
  signedVaa,
  onClick,
}: {
  parsedPayload: any;
  signedVaa: string;
  onClick: () => void;
}) {
  const relayerInfo = useRelayersAvailable(true);
  const [selectedRelayer, setSelectedRelayer] = useState<Relayer | null>(null);
  const [isAttemptingToSchedule, setIsAttemptingToSchedule] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  console.log(parsedPayload, relayerInfo, "in recovery relayer");

  const fee =
    (parsedPayload && parsedPayload.fee && parseInt(parsedPayload.fee)) || null;
  //This check is probably more sophisticated in the future. Possibly a net call.
  const isEligible =
    fee &&
    fee > 0 &&
    relayerInfo?.data?.relayers?.length &&
    relayerInfo?.data?.relayers?.length > 0;

  const handleRelayerChange = useCallback(
    (relayer: Relayer | null) => {
      setSelectedRelayer(relayer);
    },
    [setSelectedRelayer]
  );

  const handleGo = useCallback(async () => {
    console.log("handle go", selectedRelayer, parsedPayload);
    if (!(selectedRelayer && selectedRelayer.url)) {
      return;
    }

    setIsAttemptingToSchedule(true);
    axios
      .get(
        selectedRelayer.url +
        RELAY_URL_EXTENSION +
        encodeURIComponent(
          Buffer.from(hexToUint8Array(signedVaa)).toString("base64")
        )
      )
      .then(
        () => {
          setIsAttemptingToSchedule(false);
          onClick();
        },
        (error) => {
          setIsAttemptingToSchedule(false);
          enqueueSnackbar(null, {
            content: (
              <Alert severity="error">
                {"Relay request rejected. Error: " + error.message}
              </Alert>
            ),
          });
        }
      );
  }, [selectedRelayer, enqueueSnackbar, onClick, signedVaa, parsedPayload]);

  if (!isEligible) {
    return null;
  }

  return (
    <Alert variant="outlined" severity="info" sx={(theme) => ({
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      "& > .MuiAlert-message": {
        width: "100%",
      },
    })}>
      <Typography>{"This transaction is eligible to be relayed"}</Typography>
      <RelaySelector
        selectedValue={selectedRelayer}
        onChange={handleRelayerChange}
      />
      <ButtonWithLoader
        disabled={!selectedRelayer}
        onClick={handleGo}
        showLoader={isAttemptingToSchedule}
      >
        Request Relay
      </ButtonWithLoader>
    </Alert>
  );
}

export default function Recovery() {
  const { push } = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const { provider } = useEthereumProvider();
  const [type, setType] = useState("NFT");
  const isNFT = type === "NFT";
  const [recoverySourceChain, setRecoverySourceChain] =
    useState<ChainId>(CHAIN_ID_ETH);
  const [recoverySourceTx, setRecoverySourceTx] = useState("");
  const [recoverySourceTxIsLoading, setRecoverySourceTxIsLoading] =
    useState(false);
  const [recoverySourceTxError, setRecoverySourceTxError] = useState("");
  const [recoverySignedVAA, setRecoverySignedVAA] = useState("");
  const [recoveryParsedVAA, setRecoveryParsedVAA] = useState<any>(null);
  const [isVAAPending, setIsVAAPending] = useState(false);
  const [tokenId, setTokenId] = useState("");
  const { isReady, statusMessage } = useIsWalletReady(recoverySourceChain);
  const walletConnectError =
    isEVMChain(recoverySourceChain) && !isReady ? statusMessage : "";
  const parsedPayload = useMemo(() => {
    try {
      return recoveryParsedVAA?.payload
        ? isNFT
          ? parseNFTPayload(
            Buffer.from(new Uint8Array(recoveryParsedVAA.payload))
          )
          : parseTransferPayload(
            Buffer.from(new Uint8Array(recoveryParsedVAA.payload))
          )
        : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [recoveryParsedVAA, isNFT]);

  //Vlad test recovery - todo check this
  useEffect(() => {
    let cancelled = false;
    return () => {
      cancelled = true;
    };
  }, [parsedPayload]);

  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);
  const pathSourceChain = query.get("sourceChain");
  const pathSourceTransaction = query.get("transactionId");

  //This effect initializes the state based on the path params.
  useEffect(() => {
    if (!pathSourceChain && !pathSourceTransaction) {
      return;
    }
    try {
      const sourceChain: ChainId =
        CHAINS_BY_ID[parseFloat(pathSourceChain || "") as ChainId]?.id;

      if (sourceChain) {
        setRecoverySourceChain(sourceChain);
      }
      if (pathSourceTransaction) {
        setRecoverySourceTx(pathSourceTransaction);
      }
    } catch (e) {
      console.error(e);
      console.error("Invalid path params specified.");
    }
  }, [pathSourceChain, pathSourceTransaction]);

  useEffect(() => {
    if (recoverySourceTx && (!isEVMChain(recoverySourceChain) || isReady)) {
      let cancelled = false;
      if (isEVMChain(recoverySourceChain) && provider) {
        setRecoverySourceTxError("");
        setRecoverySourceTxIsLoading(true);
        (async () => {
          const { vaa, isPending, error } = await evm(
            provider,
            recoverySourceTx,
            enqueueSnackbar,
            recoverySourceChain,
            isNFT
          );
          if (!cancelled) {
            setRecoverySourceTxIsLoading(false);
            if (vaa) {
              setRecoverySignedVAA(vaa);
            }
            if (error) {
              setRecoverySourceTxError(error);
            }
            setIsVAAPending(isPending);
          }
        })();
      } else if (recoverySourceChain === CHAIN_ID_SOLANA) {
        setRecoverySourceTxError("");
        setRecoverySourceTxIsLoading(true);
        (async () => {
          const { vaa, isPending, error } = await solana(
            recoverySourceTx,
            enqueueSnackbar,
            isNFT
          );
          if (!cancelled) {
            setRecoverySourceTxIsLoading(false);
            if (vaa) {
              setRecoverySignedVAA(vaa);
            }
            if (error) {
              setRecoverySourceTxError(error);
            }
            setIsVAAPending(isPending);
          }
        })();
      }
      return () => {
        cancelled = true;
      };
    }
  }, [
    recoverySourceChain,
    recoverySourceTx,
    provider,
    enqueueSnackbar,
    isNFT,
    isReady,
  ]);
  const handleTypeChange = useCallback((event: any) => {
    setRecoverySourceChain((prevChain) =>
      event.target.value === "NFT" &&
        !CHAINS_WITH_NFT_SUPPORT.find((chain) => chain.id === prevChain)
        ? CHAIN_ID_SOLANA
        : prevChain
    );
    setType(event.target.value);
  }, []);
  const handleSourceChainChange = useCallback((event: any) => {
    setRecoverySourceTx("");
    setRecoverySourceChain(event.target.value);
  }, []);
  const handleSourceTxChange = useCallback((event: any) => {
    setRecoverySourceTx(event.target.value.trim());
  }, []);
  const handleSignedVAAChange = useCallback((event: any) => {
    setRecoverySignedVAA(event.target.value.trim());
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (recoverySignedVAA) {
      (async () => {
        try {
          const parsedVAA = parseVaa(hexToUint8Array(recoverySignedVAA));
          if (!cancelled) {
            setRecoveryParsedVAA(parsedVAA);
          }
        } catch (e) {
          console.log(e);
          if (!cancelled) {
            setRecoveryParsedVAA(null);
          }
        }
      })();
    }
    return () => {
      cancelled = true;
    };
  }, [recoverySignedVAA]);
  const parsedPayloadTargetChain = parsedPayload?.targetChain;
  const enableRecovery = recoverySignedVAA && parsedPayloadTargetChain;

  const handleRecoverClickBase = useCallback(
    (useRelayer: boolean) => {
      if (enableRecovery && recoverySignedVAA && parsedPayloadTargetChain) {
        // TODO: make recovery reducer
        if (isNFT) {
          dispatch(
            setRecoveryNFTVaa({
              vaa: recoverySignedVAA,
              parsedPayload: {
                targetChain: parsedPayload.targetChain as ChainId,
                targetAddress: parsedPayload.targetAddress,
                originChain: parsedPayload.originChain as ChainId,
                originAddress: parsedPayload.originAddress,
              },
            })
          );
          push("/nft");
        }
      }
    },
    [
      dispatch,
      enableRecovery,
      recoverySignedVAA,
      parsedPayloadTargetChain,
      parsedPayload,
      isNFT,
      push,
    ]
  );

  const handleRecoverClick = useCallback(() => {
    handleRecoverClickBase(false);
  }, [handleRecoverClickBase]);

  const handleRecoverWithRelayerClick = useCallback(() => {
    handleRecoverClickBase(true);
  }, [handleRecoverClickBase]);

  return (
    <Container maxWidth="md">
      <Card sx={{ padding: "32px 32px 16px" }}>
        <Alert severity="info" variant="outlined">
          If you have sent your tokens but have not redeemed them, you may paste
          in the Source Transaction ID (from Step 3) to resume your transfer.
        </Alert>
        <TextField
          select
          variant="outlined"
          label="Type"
          disabled={!!recoverySignedVAA}
          value={type}
          onChange={handleTypeChange}
          fullWidth
          margin="normal"
        >
          {/* <MenuItem value="Token">Token</MenuItem> */}
          <MenuItem value="NFT">NFT</MenuItem>
        </TextField>
        <ChainSelect
          select
          variant="outlined"
          label="Source Chain"
          disabled={!!recoverySignedVAA}
          value={recoverySourceChain}
          onChange={handleSourceChainChange}
          fullWidth
          margin="normal"
          chains={isNFT ? CHAINS_WITH_NFT_SUPPORT : CHAINS}
        />
        {isEVMChain(recoverySourceChain) ? (
          <KeyAndBalance chainId={recoverySourceChain} />
        ) : null}
        <TextField
          variant="outlined"
          label="Source Tx (paste here)"
          disabled={
            !!recoverySignedVAA ||
            recoverySourceTxIsLoading ||
            !!walletConnectError
          }
          value={recoverySourceTx}
          onChange={handleSourceTxChange}
          error={!!recoverySourceTxError || !!walletConnectError}
          helperText={recoverySourceTxError || walletConnectError}
          fullWidth
          margin="normal"
        />
        {/* <RelayerRecovery
          parsedPayload={parsedPayload}
          signedVaa={recoverySignedVAA}
          onClick={handleRecoverWithRelayerClick}
        /> */}
        <ButtonWithLoader
          onClick={handleRecoverClick}
          disabled={!enableRecovery}
          showLoader={recoverySourceTxIsLoading}
        >
          Recover
        </ButtonWithLoader>
        {isVAAPending && (
          <PendingVAAWarning sourceChain={recoverySourceChain} />
        )}
        <Box sx={(theme) => ({
          padding: theme.spacing(2, 0),
        })}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              Advanced
            </AccordionSummary>
            <AccordionDetails>
              <div>
                <Box position="relative">
                  <TextField
                    variant="outlined"
                    label="Signed VAA (Hex)"
                    disabled={recoverySourceTxIsLoading}
                    value={recoverySignedVAA || ""}
                    onChange={handleSignedVAAChange}
                    fullWidth
                    margin="normal"
                  />
                  {recoverySourceTxIsLoading ? (
                    <Box
                      position="absolute"
                      style={{
                        top: 0,
                        right: 0,
                        left: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : null}
                </Box>
                <Box my={4}>
                  <Divider />
                </Box>
                <TextField
                  variant="outlined"
                  label="Emitter Chain"
                  disabled
                  value={recoveryParsedVAA?.emitter_chain || ""}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Emitter Address"
                  disabled
                  value={
                    (recoveryParsedVAA &&
                      hexToNativeString(
                        recoveryParsedVAA.emitter_address,
                        recoveryParsedVAA.emitter_chain
                      )) ||
                    ""
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Sequence"
                  disabled
                  value={recoveryParsedVAA?.sequence || ""}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Timestamp"
                  disabled
                  value={
                    (recoveryParsedVAA &&
                      new Date(
                        recoveryParsedVAA.timestamp * 1000
                      ).toLocaleString()) ||
                    ""
                  }
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Guardian Set"
                  disabled
                  value={recoveryParsedVAA?.guardian_set_index || ""}
                  fullWidth
                  margin="normal"
                />
                <Box my={4}>
                  <Divider />
                </Box>
                <TextField
                  variant="outlined"
                  label="Origin Chain"
                  disabled
                  value={parsedPayload?.originChain.toString() || ""}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Origin Token Address"
                  disabled
                  value={
                    parsedPayload
                      ? hexToNativeAssetString(
                        parsedPayload.originAddress,
                        parsedPayload.originChain as ChainId
                      ) || ""
                      : ""
                  }
                  fullWidth
                  margin="normal"
                />
                {isNFT ? (
                  <TextField
                    variant="outlined"
                    label="Origin Token ID"
                    disabled
                    // @ts-ignore
                    value={parsedPayload?.tokenId || ""}
                    fullWidth
                    margin="normal"
                  />
                ) : null}
                <TextField
                  variant="outlined"
                  label="Target Chain"
                  disabled
                  value={parsedPayload?.targetChain.toString() || ""}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  variant="outlined"
                  label="Target Address"
                  disabled
                  value={
                    (parsedPayload &&
                      hexToNativeString(
                        parsedPayload.targetAddress,
                        parsedPayload.targetChain as ChainId
                      )) ||
                    ""
                  }
                  fullWidth
                  margin="normal"
                />
                {isNFT ? null : (
                  <>
                    <TextField
                      variant="outlined"
                      label="Amount"
                      disabled
                      value={
                        parsedPayload && "amount" in parsedPayload
                          ? parsedPayload.amount.toString()
                          : ""
                      }
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      variant="outlined"
                      label="Relayer Fee"
                      disabled
                      value={
                        (parsedPayload &&
                          "fee" in parsedPayload &&
                          parsedPayload?.fee?.toString()) ||
                        ""
                      }
                      fullWidth
                      margin="normal"
                    />
                  </>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Card>
    </Container >
  );
}
