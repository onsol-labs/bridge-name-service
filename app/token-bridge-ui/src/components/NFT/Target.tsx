import {
  CHAIN_ID_SOLANA,
  hexToNativeString,
  hexToUint8Array,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { TextField, Typography } from "@mui/material";
import { Alert } from "@mui/material";
import { PublicKey } from "@solana/web3.js";
import { BigNumber, ethers } from "ethers";
import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import useIsWalletReady from "../../hooks/useIsWalletReady";
import useSyncTargetAddress from "../../hooks/useSyncTargetAddress";
import { GasEstimateSummary } from "../../hooks/useTransactionFees";
import { incrementStep, setTargetChain } from "../../store/nftSlice";
import {
  selectNFTIsTargetComplete,
  selectNFTOriginChain,
  selectNFTOriginTokenId,
  selectNFTShouldLockFields,
  selectNFTSourceChain,
  selectNFTTargetAddressHex,
  selectNFTTargetAsset,
  selectNFTTargetChain,
  selectNFTTargetError,
} from "../../store/selectors";
import {
  CHAINS_BY_ID,
  CHAINS_WITH_NFT_SUPPORT,
  getIsTransferDisabled,
} from "../../utils/consts";
import ButtonWithLoader from "../ButtonWithLoader";
import ChainSelect from "../ChainSelect";
import KeyAndBalance from "../KeyAndBalance";
import LowBalanceWarning from "../LowBalanceWarning";
import StepDescription from "../StepDescription";
import ChainWarningMessage from "../ChainWarningMessage";
import { BNS_ON_ETH_PADDED } from "../../solana/constants";

function Target() {
  const dispatch = useDispatch();
  const sourceChain = useSelector(selectNFTSourceChain);
  const chains = useMemo(
    () => CHAINS_WITH_NFT_SUPPORT.filter((c) => c.id !== sourceChain),
    [sourceChain]
  );
  const targetChain = useSelector(selectNFTTargetChain);
  const targetAddressHex = useSelector(selectNFTTargetAddressHex);
  const targetAsset = useSelector(selectNFTTargetAsset);
  const originChain = useSelector(selectNFTOriginChain);
  const originAsset = BNS_ON_ETH_PADDED; // useSelector(selectNFTOriginAsset);
  const originTokenId = useSelector(selectNFTOriginTokenId);
  let tokenId;
  // console.log(originAsset)
  // console.log(originTokenId)
  // console.log(targetAddressHex)
  try {
    tokenId =
      originChain === CHAIN_ID_SOLANA && originAsset
        ? BigNumber.from(
          new PublicKey(hexToUint8Array(originAsset)).toBytes()
        ).toString()
        : originTokenId;
  } catch (e) {
    tokenId = originTokenId;
  }
  const readableTargetAddress =
    hexToNativeString(targetAddressHex, targetChain) || "";
  const error = useSelector(selectNFTTargetError);
  const isTargetComplete = useSelector(selectNFTIsTargetComplete);
  const shouldLockFields = useSelector(selectNFTShouldLockFields);
  const { statusMessage } = useIsWalletReady(targetChain);
  useSyncTargetAddress(!shouldLockFields, true);
  const handleTargetChange = useCallback(
    (event: any) => {
      dispatch(setTargetChain(event.target.value));
    },
    [dispatch]
  );
  const handleNextClick = useCallback(() => {
    dispatch(incrementStep());
  }, [dispatch]);
  const isTransferDisabled = useMemo(() => {
    return getIsTransferDisabled(targetChain, false);
  }, [targetChain]);

  console.log(targetAsset)

  return (
    <>
      <StepDescription>Select a recipient chain and address.</StepDescription>
      <ChainSelect
        select
        fullWidth
        variant="outlined"
        value={targetChain}
        onChange={handleTargetChange}
        chains={chains}
      />
      <KeyAndBalance chainId={targetChain} />
      <TextField
        label="Recipient Address"
        fullWidth
        variant="outlined"
        sx={{ marginTop: 5 }}
        value={readableTargetAddress}
        disabled={true}
      />
      {targetAsset !== ethers.constants.AddressZero ? (
        <>
          <TextField
            label="Token Address"
            fullWidth
            variant="outlined"
            sx={{ marginTop: 5 }}
            value={targetAsset || ""}
            disabled={true}
          />
          {isEVMChain(targetChain) ? (
            <TextField
              variant="outlined"
              label="TokenId"
              fullWidth
              sx={{ marginTop: 5 }}
              value={tokenId || ""}
              disabled={true}
            />
          ) : null}
        </>
      ) : null}
      <Alert severity="info" variant="outlined" sx={{
        marginTop: 1,
        marginBottom: 1,
      }}>
        <Typography>
          You will have to pay transaction fees on{" "}
          {CHAINS_BY_ID[targetChain].name} to redeem your Domain.
        </Typography>
        {isEVMChain(targetChain) && (
          <GasEstimateSummary methodType="nft" chainId={targetChain} />
        )}
      </Alert>
      <LowBalanceWarning chainId={targetChain} />
      <ChainWarningMessage chainId={targetChain} />
      <ButtonWithLoader
        disabled={!isTargetComplete || isTransferDisabled} //|| !associatedAccountExists}
        onClick={handleNextClick}
        showLoader={false}
        error={statusMessage || error}
      >
        Next
      </ButtonWithLoader>
    </>
  );
}

export default Target;
