import { makeStyles, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectTransferRedeemTx,
  selectTransferTargetChain,
} from "../../store/selectors";
import { reset } from "../../store/transferSlice";
import ButtonWithLoader from "../ButtonWithLoader";
import ShowTx from "../ShowTx";
import AddToMetamask from "./AddToMetamask";

export default function RedeemPreview({
  overrideExplainerString,
}: {
  overrideExplainerString?: string;
}) {
  const dispatch = useDispatch();
  const targetChain = useSelector(selectTransferTargetChain);
  const redeemTx = useSelector(selectTransferRedeemTx);
  const handleResetClick = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);

  const explainerString =
    overrideExplainerString ||
    "Success! The redeem transaction was submitted. The tokens will become available once the transaction confirms.";

  return (
    <>
      <Typography
        component="div"
        variant="subtitle1"
        sx={{
          textAlign: "center",
          marginBottom: 2,
        }}
      >
        {explainerString}
      </Typography>
      {redeemTx ? <ShowTx chainId={targetChain} tx={redeemTx} /> : null}
      <AddToMetamask />
      <ButtonWithLoader onClick={handleResetClick}>
        Transfer More Tokens!
      </ButtonWithLoader>
    </>
  );
}
