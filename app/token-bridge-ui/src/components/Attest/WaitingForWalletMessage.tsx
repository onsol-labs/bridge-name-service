import { CHAIN_ID_SOLANA } from "@certusone/wormhole-sdk";
import {  Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectAttestAttestTx,
  selectAttestCreateTx,
  selectAttestIsCreating,
  selectAttestIsSending,
  selectAttestTargetChain,
} from "../../store/selectors";
import { WAITING_FOR_WALLET_AND_CONF } from "../Transfer/WaitingForWalletMessage";

export default function WaitingForWalletMessage() {
  const isSending = useSelector(selectAttestIsSending);
  const attestTx = useSelector(selectAttestAttestTx);
  const targetChain = useSelector(selectAttestTargetChain);
  const isCreating = useSelector(selectAttestIsCreating);
  const createTx = useSelector(selectAttestCreateTx);
  const showWarning = (isSending && !attestTx) || (isCreating && !createTx);
  return showWarning ? (
    <Typography sx={{
      color: "warning.light",
      marginTop: 1,
      textAlign: "center",
    }} variant="body2">
      {WAITING_FOR_WALLET_AND_CONF}{" "}
      {targetChain === CHAIN_ID_SOLANA && isCreating
        ? "Note: there will be several transactions"
        : null}
    </Typography>
  ) : null;
}
