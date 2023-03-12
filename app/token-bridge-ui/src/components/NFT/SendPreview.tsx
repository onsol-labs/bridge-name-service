import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectNFTSourceChain,
  selectNFTTransferTx,
} from "../../store/selectors";
import ShowTx from "../ShowTx";

export default function SendPreview() {
  const sourceChain = useSelector(selectNFTSourceChain);
  const transferTx = useSelector(selectNFTTransferTx);

  const explainerString = "The NFT has been sent!";

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
