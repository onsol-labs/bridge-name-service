import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";
import { Button, Tooltip, Typography } from "@mui/material";
import { FileCopy, OpenInNew } from "@mui/icons-material";
import { withStyles } from 'tss-react/mui';
import { ReactChild } from "react";
import useCopyToClipboard from "../hooks/useCopyToClipboard";
import { ParsedTokenAccount } from "../store/transferSlice";
import { CLUSTER, getExplorerName } from "../utils/consts";
import { shortenAddress } from "../utils/solana";

const tooltipStyles = {
  tooltip: {
    minWidth: "max-content",
    textAlign: "center",
    "& > *": {
      margin: ".25rem",
    },
  },
};

// @ts-ignore
const StyledTooltip = withStyles(Tooltip, tooltipStyles);

export default function SmartAddress({
  chainId,
  parsedTokenAccount,
  address,
  symbol,
  tokenName,
  variant,
  noGutter,
  noUnderline,
  extraContent,
  isAsset,
}: {
  chainId: ChainId;
  parsedTokenAccount?: ParsedTokenAccount;
  address?: string;
  logo?: string;
  tokenName?: string;
  symbol?: string;
  variant?: any;
  noGutter?: boolean;
  noUnderline?: boolean;
  extraContent?: ReactChild;
  isAsset?: boolean;
}) {
  const useableAddress = parsedTokenAccount?.mintKey || address || "";
  const useableSymbol = parsedTokenAccount?.symbol || symbol || "";
  const isNative = parsedTokenAccount?.isNativeAsset || false;
  const addressShort = shortenAddress(useableAddress) || "";

  const useableName = isNative
    ? "Native Currency"
    : parsedTokenAccount?.name
      ? parsedTokenAccount.name
      : tokenName
        ? tokenName
        : "";
  const explorerAddress = isNative
    ? null
    : chainId === CHAIN_ID_ETH
      ? `https://${CLUSTER === "testnet" ? "goerli." : ""}etherscan.io/${isAsset ? "token" : "address"
      }/${useableAddress}`
      : chainId === CHAIN_ID_SOLANA
        ? `https://solscan.io/address/${useableAddress}${CLUSTER === "testnet"
          ? "?cluster=devnet"
          : ""
        }`
        : undefined;
  const explorerName = getExplorerName(chainId);

  const copyToClipboard = useCopyToClipboard(useableAddress);

  const explorerButton = !explorerAddress ? null : (
    <Button
      size="small"
      variant="outlined"
      startIcon={<OpenInNew />}
      sx={{
        marginLeft: ".5rem",
        marginRight: ".5rem",
      }}
      href={explorerAddress}
      target="_blank"
      rel="noopener noreferrer"
    >
      {"View on " + explorerName}
    </Button>
  );
  //TODO add icon here
  const copyButton = isNative ? null : (
    <Button
      size="small"
      variant="outlined"
      startIcon={<FileCopy />}
      onClick={copyToClipboard}
      sx={{
        marginLeft: ".5rem",
        marginRight: ".5rem",
      }}
    >
      Copy
    </Button>
  );

  const tooltipContent = (
    <>
      {useableName && <Typography>{useableName}</Typography>}
      {useableSymbol && !isNative && (
        <Typography noWrap variant="body2">
          {addressShort}
        </Typography>
      )}
      <div>
        {explorerButton}
        {copyButton}
      </div>
      {extraContent ? extraContent : null}
    </>
  );

  return (
    <StyledTooltip
      title={tooltipContent}
      //interactive={true}
      sx={(theme: any) => ({
        display: "inline-block",
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        textDecoration: "underline",
        textUnderlineOffset: "2px",
      })}
    >
      <Typography
        variant={variant || "body1"}

        sx={(theme) => ({
          ...{
            display: "inline-block",
            marginLeft: theme.spacing(1),
            marginRight: theme.spacing(1),
            textDecoration: "underline",
            textUnderlineOffset: "2px",
          },
          ...(noGutter && {
            marginLeft: 0,
            marginRight: 0,
          }),
          ...(noUnderline && {
            textDecoration: "none",
          })
        })}
        component="div"
      >
        {useableSymbol || addressShort}
      </Typography>
    </StyledTooltip>
  );
}
