import { ChainId, isEVMChain } from "@certusone/wormhole-sdk";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  alert: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export default function SourceAssetWarning({
  sourceChain,
  sourceAsset,
}: {
  sourceChain?: ChainId;
  sourceAsset?: string;
  originChain?: ChainId;
  targetChain?: ChainId;
  targetAsset?: string;
}) {
  if (!(sourceChain && sourceAsset)) {
    return null;
  }

  const searchableAddress = isEVMChain(sourceChain)
    ? sourceAsset.toLowerCase()
    : sourceAsset;

  return (
    <>
      { null}
    </>
  );
}
