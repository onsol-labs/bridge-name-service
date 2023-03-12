import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectAttestSourceAsset,
  selectAttestSourceChain,
} from "../../store/selectors";
import { CHAINS_BY_ID } from "../../utils/consts";
import SmartAddress from "../SmartAddress";

export default function SourcePreview() {
  const sourceChain = useSelector(selectAttestSourceChain);
  const sourceAsset = useSelector(selectAttestSourceAsset);

  const explainerContent =
    sourceChain && sourceAsset ? (
      <>
        <span>You will attest</span>
        <SmartAddress chainId={sourceChain} address={sourceAsset} isAsset />
        <span>on {CHAINS_BY_ID[sourceChain].name}</span>
      </>
    ) : (
      ""
    );

  return (
    <Typography
      component="div"
      variant="subtitle2"
      sx={{
        textAlign: "center",
      }}
    >
      {explainerContent}
    </Typography>
  );
}
