import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  selectNFTSourceChain,
  selectNFTSourceParsedTokenAccount,
} from "../../store/selectors";
import { CHAINS_BY_ID } from "../../utils/consts";
import SmartAddress from "../SmartAddress";
import NFTViewer from "../TokenSelectors/NFTViewer";

export default function SourcePreview() {
  const sourceChain = useSelector(selectNFTSourceChain);
  const sourceParsedTokenAccount = useSelector(
    selectNFTSourceParsedTokenAccount
  );

  const explainerContent =
    sourceChain && sourceParsedTokenAccount ? (
      <>
        <span>You will transfer 1 </span>
        <SmartAddress
          chainId={sourceChain}
          parsedTokenAccount={sourceParsedTokenAccount}
        />
        <span>Domain from</span>
        <SmartAddress
          chainId={sourceChain}
          address={sourceParsedTokenAccount?.publicKey}
        />
        <span>on {CHAINS_BY_ID[sourceChain].name}</span>
      </>
    ) : (
      ""
    );

  return (
    <>
      <Typography
        component="div"
        variant="subtitle2"
        sx={{
          textAlign: "center",
        }}
      >
        {explainerContent}
      </Typography>
      {sourceParsedTokenAccount ? (
        <NFTViewer value={sourceParsedTokenAccount} chainId={sourceChain} />
      ) : null}
    </>
  );
}
