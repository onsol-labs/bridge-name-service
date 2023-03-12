import {
  ChainId,
  CHAIN_ID_ETH,
  CHAIN_ID_SOLANA,
} from "@certusone/wormhole-sdk";
import { Button, Typography, Box } from "@mui/material";
import { Transaction } from "../store/transferSlice";
import { CLUSTER, getExplorerName } from "../utils/consts";

export default function ShowTx({
  chainId,
  tx,
}: {
  chainId: ChainId;
  tx: Transaction;
}) {
  const showExplorerLink = CLUSTER === "devnet" && chainId === CHAIN_ID_SOLANA;
  const explorerAddress =
    chainId === CHAIN_ID_ETH
      ? `https://${CLUSTER === "devnet" ? "goerli." : ""}etherscan.io/tx/${tx?.id
      }`
      : chainId === CHAIN_ID_SOLANA
        ? `https://solscan.io/tx/${tx?.id}${CLUSTER === "devnet"
          ? "?cluster=devnet"
          : ""
        }`
        : undefined;
  const explorerName = getExplorerName(chainId);

  return (
    <Box sx={{
      marginTop: 1,
      textAlign: "center",
    }}>
      <Typography noWrap component="div" variant="body2">
        {tx.id}
      </Typography>
      {showExplorerLink && explorerAddress ? (
        <Button
          href={explorerAddress}
          target="_blank"
          rel="noopener noreferrer"
          size="small"
          variant="outlined"
          sx={{ marginTop: 1 }}
        >
          View on {explorerName}
        </Button>
      ) : null}
    </Box>
  );
}
