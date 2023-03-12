import {
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
  isEVMChain,
  WSOL_ADDRESS,
} from "@certusone/wormhole-sdk";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Link,
  Tooltip,
  Typography,
  Box
} from "@mui/material";
import { Alert } from "@mui/material";
import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import useGetIsTransferCompleted from "../../hooks/useGetIsTransferCompleted";
import { useHandleRedeem } from "../../hooks/useHandleRedeem";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import {
  selectTransferIsRecovery,
  selectTransferTargetAsset,
  selectTransferTargetChain,
  selectTransferUseRelayer,
} from "../../store/selectors";
import { reset } from "../../store/transferSlice";
import {
  CHAINS_BY_ID,
  getHowToAddTokensToWalletUrl,
  WETH_ADDRESS,
} from "../../utils/consts";
import ButtonWithLoader from "../ButtonWithLoader";
import KeyAndBalance from "../KeyAndBalance";
import SmartAddress from "../SmartAddress";
import { SolanaCreateAssociatedAddressAlternate } from "../SolanaCreateAssociatedAddress";
import StepDescription from "../StepDescription";
import AddToMetamask from "./AddToMetamask";
import RedeemPreview from "./RedeemPreview";
import WaitingForWalletMessage from "./WaitingForWalletMessage";

function Redeem() {
  const {
    handleClick,
    handleNativeClick,
    disabled,
    showLoader,
  } = useHandleRedeem();
  const useRelayer = useSelector(selectTransferUseRelayer);
  const [manualRedeem, setManualRedeem] = useState(!useRelayer);
  const handleManuallyRedeemClick = useCallback(() => {
    setManualRedeem(true);
  }, []);
  const handleSwitchToRelayViewClick = useCallback(() => {
    if (useRelayer) {
      setManualRedeem(false);
    }
  }, [useRelayer]);
  const targetChain = useSelector(selectTransferTargetChain);
  const targetAsset = useSelector(selectTransferTargetAsset);
  const isRecovery = useSelector(selectTransferIsRecovery);
  const { isTransferCompletedLoading, isTransferCompleted } =
    useGetIsTransferCompleted(
      useRelayer ? false : true,
      useRelayer ? 5000 : undefined
    );
  const dispatch = useDispatch();
  const { isReady, statusMessage } = useIsWalletReady(targetChain);
  //TODO better check, probably involving a hook & the VAA
  const isEthNative =
    targetChain === CHAIN_ID_ETH &&
    targetAsset &&
    targetAsset.toLowerCase() === WETH_ADDRESS.toLowerCase();
  const isSolNative =
    targetChain === CHAIN_ID_SOLANA &&
    targetAsset &&
    targetAsset === WSOL_ADDRESS;
  const isNativeEligible =
    isEthNative ||
    isSolNative;
  const [useNativeRedeem, setUseNativeRedeem] = useState(true);
  const toggleNativeRedeem = useCallback(() => {
    setUseNativeRedeem(!useNativeRedeem);
  }, [useNativeRedeem]);
  const handleResetClick = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);
  const howToAddTokensUrl = getHowToAddTokensToWalletUrl(targetChain);

  const relayerContent = (
    <>
      {isEVMChain(targetChain) && !isTransferCompleted ? (
        <KeyAndBalance chainId={targetChain} />
      ) : null}

      {!isReady &&
        isEVMChain(targetChain) &&
        !isTransferCompleted ? (
        <Typography sx={{
          marginTop: 4,
          mx: 0,
          marginBottom: 2,
          textAlign: "center",
        }}>
          {"Please connect your wallet to check for transfer completion."}
        </Typography>
      ) : null}

      {(!isEVMChain(targetChain) || isReady) &&
        !isTransferCompleted ? (
        <Box sx={{
          marginTop: 4,
          mx: 0,
          marginBottom: 2,
          textAlign: "center",
        }}>
          <CircularProgress style={{ marginBottom: 16 }} />
          <Typography>
            {"Waiting for a relayer to process your transfer."}
          </Typography>
          <Tooltip title="Your fees will be refunded on the target chain">
            <Button
              onClick={handleManuallyRedeemClick}
              size="small"
              variant="outlined"
              style={{ marginTop: 16 }}
            >
              Manually redeem instead
            </Button>
          </Tooltip>
        </Box>
      ) : null}

      {isTransferCompleted ? (
        <RedeemPreview overrideExplainerString="Success! Your transfer is complete." />
      ) : null}
    </>
  );

  const nonRelayContent = (
    <>
      <KeyAndBalance chainId={targetChain} />
      {isNativeEligible && (
        <FormControlLabel
          control={
            <Checkbox
              checked={useNativeRedeem}
              onChange={toggleNativeRedeem}
              color="primary"
            />
          }
          label="Automatically unwrap to native currency"
        />
      )}
      {targetChain === CHAIN_ID_SOLANA ? (
        <SolanaCreateAssociatedAddressAlternate />
      ) : null}

      <>
        {" "}
        <ButtonWithLoader
          //TODO disable when the associated token account is confirmed to not exist
          disabled={
            !isReady ||
            disabled ||
            (isRecovery && (isTransferCompletedLoading || isTransferCompleted))
          }
          onClick={
            isNativeEligible && useNativeRedeem
              ? handleNativeClick
              : handleClick
          }
          showLoader={showLoader || (isRecovery && isTransferCompletedLoading)}
          error={statusMessage}
        >
          Redeem
        </ButtonWithLoader>
        <WaitingForWalletMessage />
      </>

      {useRelayer && !isTransferCompleted ? (
        <Box sx={{
          marginTop: 4,
          mx: 0,
          marginBottom: 2,
          textAlign: "center",
        }}>
          <Button
            onClick={handleSwitchToRelayViewClick}
            size="small"
            variant="outlined"
            style={{ marginTop: 16 }}
          >
            Return to relayer view
          </Button>
        </Box>
      ) : null}

      {isRecovery && isReady && isTransferCompleted ? (
        <>
          <Alert severity="info" variant="outlined" sx={{
            marginTop: 1,
            marginBottom: 1,
          }}>
            These tokens have already been redeemed.{" "}
            {!isEVMChain(targetChain) && howToAddTokensUrl ? (
              <Link
                href={howToAddTokensUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Click here to see how to add them to your wallet.
              </Link>
            ) : null}
          </Alert>
          {targetAsset ? (
            <>
              <span>Token Address:</span>
              <SmartAddress
                chainId={targetChain}
                address={targetAsset || undefined}
                isAsset
              />
            </>
          ) : null}
          {isEVMChain(targetChain) ? <AddToMetamask /> : null}
          <ButtonWithLoader onClick={handleResetClick}>
            Transfer More Tokens!
          </ButtonWithLoader>
        </>
      ) : null}
    </>
  );

  return (
    <>
      <StepDescription>Receive the tokens on the target chain</StepDescription>
      {manualRedeem ? nonRelayContent : relayerContent}
    </>
  );
}

export default Redeem;
