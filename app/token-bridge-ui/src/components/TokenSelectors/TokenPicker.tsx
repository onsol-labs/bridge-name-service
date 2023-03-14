import { ChainId } from "@certusone/wormhole-sdk";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  TextField,
  Tooltip,
  Typography,
  Box
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { NFTParsedTokenAccount } from "../../store/nftSlice";
import { selectTransferTargetChain } from "../../store/selectors";
import { balancePretty } from "../../utils/balancePretty";
import { getIsTokenTransferDisabled } from "../../utils/consts";
import { shortenAddress } from "../../utils/solana";
import NFTViewer from "./NFTViewer";

export const BasicAccountRender = (
  account: MarketParsedTokenAccount,
  nft: boolean,
  displayBalance?: (account: NFTParsedTokenAccount) => boolean
) => {
  const mintPrettyString = shortenAddress(account.mintKey);
  const uri = nft ? account.image_256 : account.logo || account.uri;
  const symbol = account.symbol || "Unknown";
  const name = account.name || "Unknown";
  const nftName = account.nftName;
  const tokenId = account.tokenId ? shortenAddress(account.tokenId) : account.tokenId;
  const shouldDisplayBalance = !displayBalance || displayBalance(account);

  // console.log(account)
  const nftContent = (
    <Box
      sx={(theme) => ({
        display: "flex",
        width: "100%",
        alignItems: "center",
        "& div": {
          margin: theme.spacing(1),
          flexBasis: "25%",
          "& .TokenImageContainer": {
            maxWidth: 40,
          },
          "&:last-child": {
            textAlign: "right",
          },
          flexShrink: 1,
        },
        flexWrap: "wrap",
      })}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          margin: 0,
        }}
        className="TokenImageContainer">
        {uri && <Box component="img" alt="" sx={{
          maxHeight: "3.5rem", //Eyeballing this based off the text size
        }} src={uri} />}
      </Box>
      <div>
        <Typography>{symbol}</Typography>
        {/* <Typography>{name}</Typography> */}
        <Typography>{nftName}</Typography>
      </div>
      <div>
        <Typography>{mintPrettyString}</Typography>
        <Typography style={{ wordBreak: "break-all" }}>{tokenId}</Typography>
      </div>
    </Box>
  );
  const tokenContent = (
    <Box
      sx={(theme) => ({
        display: "flex",
        width: "100%",
        alignItems: "center",
        "& div": {
          margin: theme.spacing(1),
          flexBasis: "25%",
          "& .TokenImageContainer": {
            maxWidth: 40,
          },
          "&:last-child": {
            textAlign: "right",
          },
          flexShrink: 1,
        },
        flexWrap: "wrap",
      })}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
        }}
        className="TokenImageContainer">
        {uri && <Box component="img" alt="" sx={{
          maxHeight: "2.5rem", //Eyeballing this based off the text size
        }} src={uri} />}
      </Box>
      <div>
        <Typography variant="subtitle1">{nftName}</Typography>
      </div>
      <div>
        {
          <Typography variant="body1">
            {account.isNativeAsset ? "Native" : mintPrettyString}
          </Typography>
        }
      </div>
      <div>
        {shouldDisplayBalance ? (
          <>
            <Typography variant="body2">{"Balance"}</Typography>
            <Typography variant="h6">
              {balancePretty(account.uiAmountString)}
            </Typography>
          </>
        ) : (
          <div />
        )}
      </div>
    </Box>
  );

  return nft ? nftContent : tokenContent;
};

interface MarketParsedTokenAccount extends NFTParsedTokenAccount {
  markets?: string[];
}

export default function TokenPicker({
  value,
  options,
  RenderOption,
  onChange,
  isValidAddress,
  getAddress,
  disabled,
  resetAccounts,
  nft,
  chainId,
  error,
  showLoader,
  useTokenId,
}: {
  value: NFTParsedTokenAccount | null;
  options: NFTParsedTokenAccount[];
  RenderOption: ({
    account,
  }: {
    account: NFTParsedTokenAccount;
  }) => JSX.Element;
  onChange: (newValue: NFTParsedTokenAccount | null) => Promise<void>;
  isValidAddress?: (address: string, chainId: ChainId) => boolean;
  getAddress?: (
    address: string,
    name: string,
    symbol: string,
    uri: string,
    tokenId?: string
  ) => Promise<NFTParsedTokenAccount>;
  disabled: boolean;
  resetAccounts: (() => void) | undefined;
  nft: boolean;
  chainId: ChainId;
  error?: string;
  showLoader?: boolean;
  useTokenId?: boolean;
}) {
  const [holderString, setHolderString] = useState("");
  const [tokenIdHolderString, setTokenIdHolderString] = useState("");
  const [loadingError, setLoadingError] = useState("");
  const [isLocalLoading, setLocalLoading] = useState(false);
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [selectionError, setSelectionError] = useState("");

  const targetChain = useSelector(selectTransferTargetChain);

  const openDialog = useCallback(() => {
    setHolderString("");
    setSelectionError("");
    setDialogIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setDialogIsOpen(false);
  }, []);

  const handleSelectOption = useCallback(
    async (option: NFTParsedTokenAccount) => {
      setSelectionError("");
      let newOption = null;
      // console.log('handleSelectOption')
      try {
        //Covalent balances tend to be stale, so we make an attempt to correct it at selection time.
        if (getAddress && !option.isNativeAsset) {
          // console.log('getting addy')
          newOption = await getAddress(option.mintKey, option.nftName ?? "null", option.symbol ?? "null", option.uri ?? "null", option.tokenId,);
          newOption = {
            ...option,
            ...newOption,
            // keep logo and uri from covalent / market list / etc (otherwise would be overwritten by undefined)
            logo: option.logo || newOption.logo,
            uri: option.uri || newOption.uri,
          } as NFTParsedTokenAccount;
          // console.log('newOption: ', newOption)
        } else {
          newOption = option;
        }
        await onChange(newOption);
        closeDialog();
      } catch (e: any) {
        if (e.message?.includes("v1")) {
          setSelectionError(e.message);
        } else {
          setSelectionError(
            "Unable to retrieve required information about this token. Ensure your wallet is connected, then refresh the list."
          );
        }
      }
    },
    [getAddress, onChange, closeDialog]
  );

  const resetAccountsWrapper = useCallback(() => {
    setHolderString("");
    setTokenIdHolderString("");
    setSelectionError("");
    resetAccounts && resetAccounts();
  }, [resetAccounts]);

  const searchFilter = useCallback(
    (option: NFTParsedTokenAccount) => {
      if (!holderString) {
        return true;
      }
      const optionString = (
        (option.publicKey || "") +
        " " +
        (option.mintKey || "") +
        " " +
        (option.symbol || "") +
        " " +
        (option.name || " ")
      ).toLowerCase();
      const searchString = holderString.toLowerCase();
      return optionString.includes(searchString);
    },
    [holderString]
  );

  const nonFeaturedOptions = useMemo(() => {
    return options.filter(
      (option: NFTParsedTokenAccount) => searchFilter(option) // &&
      //nft
    );
  }, [options, searchFilter]);

  const localFind = useCallback(
    (address: string, tokenIdHolderString: string) => {
      return options.find(
        (x) =>
          x.mintKey === address &&
          (!tokenIdHolderString || x.tokenId === tokenIdHolderString)
      );
    },
    [options]
  );

  //This is the effect which allows pasting an address in directly
  useEffect(() => {
    if (!isValidAddress || !getAddress) {
      return;
    }
    if (useTokenId && !tokenIdHolderString) {
      return;
    }
    setLoadingError("");
    let cancelled = false;
    if (isValidAddress(holderString, chainId)) {
      const option = localFind(holderString, tokenIdHolderString);
      if (option) {
        handleSelectOption(option);
        return () => {
          cancelled = true;
        };
      }
      setLocalLoading(true);
      setLoadingError("");
      getAddress(
        holderString,
        "null", "null", "null",
        useTokenId ? tokenIdHolderString : undefined
      ).then(
        (result) => {
          if (!cancelled) {
            setLocalLoading(false);
            if (result) {
              handleSelectOption(result);
            }
          }
        },
        (error) => {
          if (!cancelled) {
            setLocalLoading(false);
            setLoadingError("Could not find the specified address.");
          }
        }
      );
    }
    return () => (cancelled = true);
  }, [
    holderString,
    isValidAddress,
    getAddress,
    handleSelectOption,
    localFind,
    tokenIdHolderString,
    useTokenId,
    chainId,
  ]);

  //TODO reset button
  //TODO debounce & save hotloaded options as an option before automatically selecting
  //TODO sigfigs function on the balance strings

  const localLoader = (
    <Box sx={{
      textAlign: "center",
    }}>
      <CircularProgress />
      <Typography variant="body2">
        {showLoader ? "Loading available tokens" : "Searching for results"}
      </Typography>
    </Box>
  );

  const displayLocalError = (
    <Box sx={{
      textAlign: "center",
    }}>
      <Typography variant="body2" color="error">
        {loadingError || selectionError}
      </Typography>
    </Box>
  );

  const dialog = (
    <Dialog
      onClose={closeDialog}
      aria-labelledby="simple-dialog-title"
      open={dialogIsOpen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box id="simple-dialog-title" sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}>
          <Typography variant="h5">Select a domain</Typography>
          <Box flexGrow={1} />
          <Tooltip title="Reload tokens">
            <IconButton onClick={resetAccountsWrapper} size="large">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent sx={{
        overflowX: "hidden",
      }}>
        <TextField
          variant="outlined"
          label="Search name or paste address"
          value={holderString}
          onChange={(event) => setHolderString(event.target.value)}
          fullWidth
          margin="normal"
        />
        {useTokenId ? (
          <TextField
            variant="outlined"
            label="Token Id"
            value={tokenIdHolderString}
            onChange={(event) => setTokenIdHolderString(event.target.value)}
            fullWidth
            margin="normal"
          />
        ) : null}
        {isLocalLoading || showLoader ? (
          localLoader
        ) : loadingError || selectionError ? (
          displayLocalError
        ) : (
          <List component="div" sx={(theme) => ({
            maxHeight: theme.spacing(80), //TODO smarter
            height: theme.spacing(80),
            overflow: "auto",
          })}>
            {nonFeaturedOptions.map((option) => {
              return (
                <ListItem
                  component="div"
                  button
                  onClick={() => handleSelectOption(option)}
                  key={
                    option.publicKey + option.mintKey + (option.tokenId || "")
                  }
                  disabled={getIsTokenTransferDisabled(
                    chainId,
                    targetChain,
                    option.mintKey
                  )}
                >
                  <RenderOption account={option} />
                </ListItem>
              );
            })}
            {nonFeaturedOptions.length ? null : (
              <Box sx={{
                textAlign: "center",
              }}>
                <Typography>No results found</Typography>
              </Box>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );

  const selectionChip = (
    <Box sx={(theme) => ({
      textAlign: "center",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    })}>
      <Button
        onClick={openDialog}
        disabled={disabled}
        variant="outlined"
        startIcon={<KeyboardArrowDownIcon />}
        sx={(theme) => ({
          maxWidth: "100%",
          width: theme.breakpoints.values.sm,
        })}
      >
        {
          value ? (
            <RenderOption account={value} />
          ) : (
            <Typography color="textSecondary">Select a domain</Typography>
          )
        }
      </Button >
    </Box >
  );

  return (
    <>
      {dialog}
      {value && nft ? <NFTViewer value={value} chainId={chainId} /> : null}
      {selectionChip}
    </>
  );
}
