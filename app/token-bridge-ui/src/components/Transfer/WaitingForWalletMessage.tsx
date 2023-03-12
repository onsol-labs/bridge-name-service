import { CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectTransferIsApproving,
  selectTransferIsRedeeming,
  selectTransferIsSending,
  selectTransferRedeemTx,
  selectTransferTargetChain,
  selectTransferTransferTx,
} from "../../store/selectors";

export const WAITING_FOR_WALLET_AND_CONF =
  "Waiting for wallet approval (likely in a popup) and confirmation...";

export default function WaitingForWalletMessage() {
  const isApproving = useSelector(selectTransferIsApproving);
  const isSending = useSelector(selectTransferIsSending);
  const transferTx = useSelector(selectTransferTransferTx);
  const targetChain = useSelector(selectTransferTargetChain);
  const isRedeeming = useSelector(selectTransferIsRedeeming);
  const redeemTx = useSelector(selectTransferRedeemTx);
  const showWarning =
    isApproving || (isSending && !transferTx) || (isRedeeming && !redeemTx);
  return showWarning ? (
    <Typography sx={{
      color: "warning.light",
      marginTop: 1,
      textAlign: "center",
    }} variant="body2">
      {WAITING_FOR_WALLET_AND_CONF}{" "}
      {targetChain === CHAIN_ID_SOLANA && isRedeeming
        ? "Note: there will be several transactions"
        : null}
    </Typography>
  ) : null;
}
