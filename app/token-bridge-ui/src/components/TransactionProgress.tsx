import {
  ChainId,
  CHAIN_ID_SOLANA,
  isEVMChain,
} from "@certusone/wormhole-sdk";
import { LinearProgress, Typography, Box } from "@mui/material";
import { Connection } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useEthereumProvider } from "../contexts/EthereumProviderContext";
import { Transaction } from "../store/transferSlice";
import { CHAINS_BY_ID, SOLANA_HOST } from "../utils/consts";

export default function TransactionProgress({
  chainId,
  tx,
  isSendComplete,
}: {
  chainId: ChainId;
  tx: Transaction | undefined;
  isSendComplete: boolean;
}) {
  const { provider } = useEthereumProvider();
  const [currentBlock, setCurrentBlock] = useState(0);
  useEffect(() => {
    if (isSendComplete || !tx) return;
    if (isEVMChain(chainId) && provider) {
      let cancelled = false;
      (async () => {
        while (!cancelled) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          try {
            const newBlock = await provider.getBlockNumber();
            if (!cancelled) {
              setCurrentBlock(newBlock);
            }
          } catch (e) {
            console.error(e);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }
    if (chainId === CHAIN_ID_SOLANA) {
      let cancelled = false;
      const connection = new Connection(SOLANA_HOST, "confirmed");
      const sub = connection.onSlotChange((slotInfo) => {
        if (!cancelled) {
          setCurrentBlock(slotInfo.slot);
        }
      });
      return () => {
        cancelled = true;
        connection.removeSlotChangeListener(sub);
      };
    }
  }, [isSendComplete, chainId, provider, tx]);
  const blockDiff =
    tx && tx.block && currentBlock ? currentBlock - tx.block : undefined;
  const expectedBlocks = // minimum confirmations enforced by guardians or specified by the contract
    chainId === CHAIN_ID_SOLANA
      ? 32
      : isEVMChain(chainId)
        ? 15
        : 1;
  if (
    !isSendComplete &&
    (chainId === CHAIN_ID_SOLANA || isEVMChain(chainId)) &&
    blockDiff !== undefined
  ) {
    return (
      <Box sx={(theme) => ({
        marginTop: theme.spacing(2),
        textAlign: "center",
      })}
      >
        <LinearProgress
          value={
            blockDiff < expectedBlocks ? (blockDiff / expectedBlocks) * 75 : 75
          }
          variant="determinate"
        />
        <Typography variant="body2" sx={(theme) => ({ marginTop: theme.spacing(1) })}>
          {blockDiff < expectedBlocks
            ? `Waiting for ${blockDiff} / ${expectedBlocks} confirmations on ${CHAINS_BY_ID[chainId].name}...`
            : `Waiting for Wormhole Network consensus...`}
        </Typography>
      </Box>
    );
  }
  return null;
}
