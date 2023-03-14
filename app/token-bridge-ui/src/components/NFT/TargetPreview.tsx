import { makeStyles } from 'tss-react/mui';
import { Typography } from '@mui/material';
import { useSelector } from "react-redux";
import {
  selectNFTTargetAddressHex,
  selectNFTTargetChain,
} from "../../store/selectors";
import { hexToNativeString } from "@certusone/wormhole-sdk";
import { CHAINS_BY_ID } from "../../utils/consts";
import SmartAddress from "../SmartAddress";

const useStyles = makeStyles()((theme) => ({
  description: {
    textAlign: "center",
  },
}));

export default function TargetPreview() {
  const { classes } = useStyles();
  const targetChain = useSelector(selectNFTTargetChain);
  const targetAddress = useSelector(selectNFTTargetAddressHex);
  // console.log("targetAddress: ", targetAddress)
  const targetAddressNative = hexToNativeString(targetAddress, targetChain);
  // console.log("targetAddressNative: ", targetAddressNative)

  const explainerContent =
    targetChain && targetAddressNative ? (
      <>
        <span>to</span>
        <SmartAddress chainId={targetChain} address={targetAddressNative} />
        <span>on {CHAINS_BY_ID[targetChain].name}</span>
      </>
    ) : (
      ""
    );

  return (
    <Typography
      component="div"
      variant="subtitle2"
      className={classes.description}
    >
      {explainerContent}
    </Typography>
  );
}