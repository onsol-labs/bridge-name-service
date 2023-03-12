import { CircularProgress, Box } from "@mui/material";
import { useSelector } from "react-redux";
import useFetchForeignAsset from "../../hooks/useFetchForeignAsset";
import { useHandleCreateWrapped } from "../../hooks/useHandleCreateWrapped";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import {
  selectAttestSourceAsset,
  selectAttestSourceChain,
  selectAttestTargetChain,
} from "../../store/selectors";
import ButtonWithLoader from "../ButtonWithLoader";
import KeyAndBalance from "../KeyAndBalance";
import WaitingForWalletMessage from "./WaitingForWalletMessage";

function Create() {
  const targetChain = useSelector(selectAttestTargetChain);
  const originAsset = useSelector(selectAttestSourceAsset);
  const originChain = useSelector(selectAttestSourceChain);
  const { isReady, statusMessage } = useIsWalletReady(targetChain);
  const foreignAssetInfo = useFetchForeignAsset(
    originChain,
    originAsset,
    targetChain
  );
  const shouldUpdate = foreignAssetInfo.data?.doesExist;
  const error = foreignAssetInfo.error || statusMessage;
  const { handleClick, disabled, showLoader } = useHandleCreateWrapped(
    shouldUpdate || false
  );

  return (
    <>
      <KeyAndBalance chainId={targetChain} />
      {foreignAssetInfo.isFetching ? (
        <>
          <Box sx={{ height: 2 }} />
          <CircularProgress sx={{
            margin: "0 auto",
            display: "block",
            textAlign: "center"
          }} />
        </>
      ) : (
        <>
          <ButtonWithLoader
            disabled={!isReady || disabled}
            onClick={handleClick}
            showLoader={showLoader}
            error={error}
          >
            {shouldUpdate ? "Update" : "Create"}
          </ButtonWithLoader>
          <WaitingForWalletMessage />
        </>
      )}
    </>
  );
}

export default Create;
