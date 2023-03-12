import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectTransferSourceChain,
  selectTransferTransferTx,
} from "../../store/selectors";
import ShowTx from "../ShowTx";

export default function SendPreview() {
  const sourceChain = useSelector(selectTransferSourceChain);
  const transferTx = useSelector(selectTransferTransferTx);

  const explainerString = "The tokens have entered the bridge!";

  return (
    <>
      <Typography
        component="div"
        variant="subtitle2"
        sx={{
          textAlign: "center",
        }}
      >
        {explainerString}
      </Typography>
      {transferTx ? <ShowTx chainId={sourceChain} tx={transferTx} /> : null}
    </>
  );
}
