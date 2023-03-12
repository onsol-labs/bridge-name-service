import { ChainId } from "@certusone/wormhole-sdk";
import { Typography } from "@mui/material";
import { Alert } from "@mui/material";
import { useSelector } from "react-redux";
import useIsWalletReady from "../hooks/useIsWalletReady";
import useTransactionFees from "../hooks/useTransactionFees";
import { selectTransferUseRelayer } from "../store/selectors";
import { getDefaultNativeCurrencySymbol } from "../utils/consts";

function LowBalanceWarning({ chainId }: { chainId: ChainId }) {
  const { isReady } = useIsWalletReady(chainId);
  const transactionFeeWarning = useTransactionFees(chainId);
  const relayerSelected = !!useSelector(selectTransferUseRelayer);

  const displayWarning =
    isReady &&
    !relayerSelected &&
    (transactionFeeWarning.balanceString) &&
    transactionFeeWarning.isSufficientBalance === false;

  const warningMessage = `This wallet has a very low ${getDefaultNativeCurrencySymbol(
    chainId
  )} balance and may not be able to pay for the upcoming transaction fees.`;

  const content = (
    <Alert severity="warning" variant="outlined" sx={{
      marginTop: 1,
      marginBottom: 1,
    }}>
      <Typography variant="body1">{warningMessage}</Typography>
      {
        <Typography variant="body1">
          {"Current balance: " + transactionFeeWarning.balanceString}
        </Typography>
      }
    </Alert>
  );

  return displayWarning ? content : null;
}

export default LowBalanceWarning;
