import { makeStyles, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import {
  selectNFTTargetAddressHex,
  selectNFTTargetChain,
} from "../../store/selectors";
import { hexToNativeString } from "@certusone/wormhole-sdk";
import { CHAINS_BY_ID } from "../../utils/consts";
import SmartAddress from "../SmartAddress";

const useStyles = makeStyles((theme) => ({
  description: {
    textAlign: "center",
  },
}));

export default function TargetPreview() {
  const classes = useStyles();
  const targetChain = useSelector(selectNFTTargetChain);
  const targetAddress = useSelector(selectNFTTargetAddressHex);
  console.log("targetAddress: ", targetAddress)
  const targetAddressNative = hexToNativeString(targetAddress, targetChain);
  console.log("targetAddressNative: ", targetAddressNative)

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

//    �
// �     `⊗Ob��h�jǫ ��e���k�
// l,>���F��["B\̹q�!
// ��s��)O�X� ���B� d��TR              �����.+��3n����iR���       \            ��S�M=�]�S����kf�� BNS                             Bridge Name Service             �|�#*{��U"��au2a���!)���Ȝhttps://metadata.ens.domains/goerli/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/95657237020374255834102764440474297266318871534933252701091726318535787353544t1�+O�?��w�mf������΄D�[�{h��j �   grpc-status: 0
