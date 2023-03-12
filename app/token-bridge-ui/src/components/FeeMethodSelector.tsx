import {
  hexToNativeAssetString,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import {
  Card,
  Checkbox,
  Chip,
  Typography,
  Box,
} from "@mui/material";
import { parseUnits } from "ethers/lib/utils";
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SmartAddress from "../components/SmartAddress";
import useRelayerInfo from "../hooks/useRelayerInfo";
import { GasEstimateSummary } from "../hooks/useTransactionFees";
import {
  selectTransferAmount,
  selectTransferOriginAsset,
  selectTransferOriginChain,
  selectTransferSourceChain,
  selectTransferSourceParsedTokenAccount,
  selectTransferTargetChain,
  selectTransferUseRelayer,
} from "../store/selectors";
import { setRelayerFee, setUseRelayer } from "../store/transferSlice";
import { CHAINS_BY_ID, getDefaultNativeCurrencySymbol } from "../utils/consts";

function FeeMethodSelector() {
  const originAsset = useSelector(selectTransferOriginAsset);
  const originChain = useSelector(selectTransferOriginChain);
  const targetChain = useSelector(selectTransferTargetChain);
  const transferAmount = useSelector(selectTransferAmount);
  const relayerInfo = useRelayerInfo(originChain, originAsset, targetChain);
  const sourceParsedTokenAccount = useSelector(
    selectTransferSourceParsedTokenAccount
  );
  const sourceDecimals = sourceParsedTokenAccount?.decimals;
  let vaaNormalizedAmount: string | undefined = undefined;
  if (transferAmount && sourceDecimals !== undefined) {
    try {
      vaaNormalizedAmount = parseUnits(
        transferAmount,
        Math.min(sourceDecimals, 8)
      ).toString();
    } catch (e) { }
  }
  const sourceSymbol = sourceParsedTokenAccount?.symbol;
  const sourceChain = useSelector(selectTransferSourceChain);
  const dispatch = useDispatch();
  const relayerSelected = !!useSelector(selectTransferUseRelayer);

  // console.log("relayer info in fee method selector", relayerInfo);

  const relayerEligible =
    relayerInfo.data &&
    relayerInfo.data.isRelayable &&
    relayerInfo.data.feeFormatted &&
    relayerInfo.data.feeUsd;

  const chooseRelayer = useCallback(() => {
    if (relayerEligible) {
      dispatch(setUseRelayer(true));
      dispatch(setRelayerFee(relayerInfo.data?.feeFormatted));
    }
  }, [relayerInfo, dispatch, relayerEligible]);

  const chooseManual = useCallback(() => {
    dispatch(setUseRelayer(false));
    dispatch(setRelayerFee(undefined));
  }, [dispatch]);

  useEffect(() => {
    if (relayerInfo.data?.isRelayable === true) {
      chooseRelayer();
    } else if (relayerInfo.data?.isRelayable === false) {
      chooseManual();
    }
    //If it's undefined / null it's still loading, so no action is taken.
  }, [
    relayerInfo,
    chooseRelayer,
    chooseManual,
  ]);

  const relayerContent = (
    <Card

      sx={(theme) => ({
        ...{
          display: "flex",
          margin: theme.spacing(2),
          alignItems: "center",
          justifyContent: "space-between",
          padding: theme.spacing(1),
          "& > *": {
            margin: ".5rem",
          },
          border: "1px solid ",
        },
        ...(relayerSelected && {
          border: "1px solid "
        }),
        ...(relayerEligible && {
          "&:hover": {
            cursor: "pointer",
            boxShadow: "inset 0 0 100px 100px rgba(255, 255, 255, 0.1)",
          },
        }),
      })}

      onClick={chooseRelayer}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "flex",
          "& > *": {
            margin: "0rem 1rem 0rem 1rem",
          },
        }}>
        <Checkbox
          checked={relayerSelected}
          disabled={!relayerEligible}
          onClick={chooseRelayer}
          sx={{ display: "inline-block", }}
        />
        <Box
          sx={{
            textAlign: "left",
            display: "inline-block",
          }}>
          {relayerEligible ? (
            <div>
              <Typography variant="body1">Automatic Payment</Typography>
              <Typography variant="body2" color="textSecondary">
                {`Pay with additional ${sourceSymbol ? sourceSymbol : "tokens"
                  } and use a relayer`}
              </Typography>
            </div>
          ) : (
            <>
              <Typography color="textSecondary" variant="body2">
                {"Automatic redeem is unavailable for this token."}
              </Typography>
              <div />
            </>
          )}
        </Box>
      </Box>
      {/* TODO fixed number of decimals on these strings */}
      {relayerEligible ? (
        <>
          <div>
            <Chip label="Beta"
              sx={(theme) => ({
                background: "linear-gradient(20deg, #f44b1b 0%, #eeb430 100%)",
                marginLeft: theme.spacing(1),
                fontSize: "120%",
              })} />
          </div>
          <div>
            <div>
              <Typography sx={{ display: "inline-block", }}>
                {/* Transfers are max 8 decimals */}
                {parseFloat(relayerInfo.data?.feeFormatted || "0").toFixed(
                  Math.min(sourceParsedTokenAccount?.decimals || 8, 8)
                )}
              </Typography>
              <SmartAddress
                chainId={sourceChain}
                parsedTokenAccount={sourceParsedTokenAccount}
                isAsset
              />
            </div>{" "}
            <Typography>{`($ ${relayerInfo.data?.feeUsd})`}</Typography>
          </div>
        </>
      ) : null}
    </Card>
  );

  const manualRedeemContent = (
    <Card
      sx={(theme) => ({
        ...{
          display: "flex",
          margin: theme.spacing(2),
          alignItems: "center",
          justifyContent: "space-between",
          padding: theme.spacing(1),
          "& > *": {
            margin: ".5rem",
          },
          border: "1px solid ",
        },
        ...({
          border: "1px solid "
        }),
        ...(relayerEligible && {
          "&:hover": {
            cursor: "pointer",
            boxShadow: "inset 0 0 100px 100px rgba(255, 255, 255, 0.1)",
          },
        }),
      })}
      onClick={chooseManual}
    >
      <Box sx={{
        alignItems: "center",
        display: "flex",
        "& > *": {
          margin: "0rem 1rem 0rem 1rem",
        },
      }}>
        <Checkbox
          checked={!relayerSelected}
          onClick={chooseManual}
          sx={{ display: "inline-block", }}
        />
        <Box sx={{
          textAlign: "left",
          display: "inline-block",
        }}>
          <Typography variant="body1">{"Manual Payment"}</Typography>
          <Typography variant="body2" color="textSecondary">
            {`Pay with your own ${getDefaultNativeCurrencySymbol(targetChain)} on ${CHAINS_BY_ID[targetChain]?.name || "target chain"}`}
          </Typography>
        </Box>
      </Box>
      {(isEVMChain(targetChain)) && (
        <GasEstimateSummary
          methodType="transfer"
          chainId={targetChain}
          priceQuote={relayerInfo.data?.targetNativeAssetPriceQuote}
        />
      )}
    </Card>
  );

  return (
    <Box sx={{
      marginTop: "2rem",
      textAlign: "center",
    }}>
      <Typography
        sx={(theme) => ({
          margin: theme.spacing(2),
        })}
        variant="subtitle2"
        color="textSecondary"
      >
        How would you like to pay the target chain fees?
      </Typography>
      {relayerContent}
      {manualRedeemContent}
    </Box >
  );
}

export default FeeMethodSelector;
