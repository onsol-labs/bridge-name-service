import { Typography } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectNFTRedeemTx, selectNFTTargetChain } from "../../store/selectors";
import { reset } from "../../store/nftSlice";
import ButtonWithLoader from "../ButtonWithLoader";
import ShowTx from "../ShowTx";

export default function RedeemPreview() {
  const dispatch = useDispatch();
  const targetChain = useSelector(selectNFTTargetChain);
  const redeemTx = useSelector(selectNFTRedeemTx);
  const handleResetClick = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);

  const explainerString =
    "Success! The redeem transaction was submitted. The NFT will become available once the transaction confirms.";

  return (
    <>
      <Typography
        component="div"
        variant="subtitle2"
        sx={{ textAlign: "center" }}
      >
        {explainerString}
      </Typography>
      {redeemTx ? <ShowTx chainId={targetChain} tx={redeemTx} /> : null}
      <ButtonWithLoader onClick={handleResetClick}>
        Transfer Another NFT!
      </ButtonWithLoader>
    </>
  );
}
