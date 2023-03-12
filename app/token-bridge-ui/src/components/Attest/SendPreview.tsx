import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectAttestSourceChain,
  selectAttestAttestTx,
} from "../../store/selectors";
import ShowTx from "../ShowTx";

export default function SendPreview() {
  const sourceChain = useSelector(selectAttestSourceChain);
  const attestTx = useSelector(selectAttestAttestTx);

  const explainerString = "The token has been attested!";

  return (
    <>
      <Typography
        component="div"
        variant="subtitle2"
        sx={{ textAlign: "center" }}
      >
        {explainerString}
      </Typography>
      {attestTx ? <ShowTx chainId={sourceChain} tx={attestTx} /> : null}
    </>
  );
}
