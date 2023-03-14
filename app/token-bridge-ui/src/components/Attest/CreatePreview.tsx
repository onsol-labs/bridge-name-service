import { Link, Typography } from "@mui/material";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAttestCreateTx,
  selectAttestTargetChain,
} from "../../store/selectors";
import { reset } from "../../store/attestSlice";
import ButtonWithLoader from "../ButtonWithLoader";
import ShowTx from "../ShowTx";
import { useHistory } from "react-router";
import { getHowToAddToTokenListUrl } from "../../utils/consts";
import { Alert } from "@mui/material";

export default function CreatePreview() {
  const { push } = useHistory();
  const dispatch = useDispatch();
  const targetChain = useSelector(selectAttestTargetChain);
  const createTx = useSelector(selectAttestCreateTx);
  const handleResetClick = useCallback(() => {
    dispatch(reset());
  }, [dispatch]);
  const handleReturnClick = useCallback(() => {
    dispatch(reset());
    push("/transfer");
  }, [dispatch, push]);

  const explainerString =
    "Success! The create wrapped transaction was submitted.";
  const howToAddToTokenListUrl = getHowToAddToTokenListUrl(targetChain);

  return (
    <>
      <Typography
        component="div"
        variant="subtitle2"
        sx={{
          textAlign: "center"
        }}
      >
        {explainerString}
      </Typography>
      {createTx ? <ShowTx chainId={targetChain} tx={createTx} /> : null}
      {howToAddToTokenListUrl ? (
        <Alert severity="info" variant="outlined" sx={{ marginTop: 1 }}>
          Remember to add the token to the{" "}
          <Link
            href={howToAddToTokenListUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            token list
          </Link>
          {"."}
        </Alert>
      ) : null}
      <ButtonWithLoader onClick={handleResetClick}>
        Attest Another Token!
      </ButtonWithLoader>
      <ButtonWithLoader onClick={handleReturnClick}>
        Return to Transfer
      </ButtonWithLoader>
    </>
  );
}
