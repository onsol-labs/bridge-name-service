import {
  ChainId,
  CHAIN_ID_AURORA,
  CHAIN_ID_AVAX,
  CHAIN_ID_BSC,
  CHAIN_ID_CELO,
  CHAIN_ID_ETH,
  CHAIN_ID_FANTOM,
  CHAIN_ID_KARURA,
  CHAIN_ID_NEAR,
  CHAIN_ID_MOONBEAM,
  CHAIN_ID_OASIS,
  CHAIN_ID_POLYGON,
  CHAIN_ID_SOLANA,
  CHAIN_ID_ACALA,
  CHAIN_ID_XPLA,
  CHAIN_ID_ARBITRUM,
  CHAIN_ID_BASE,
} from "@certusone/wormhole-sdk";
import { Button, makeStyles, Typography } from "@material-ui/core";
import { Transaction } from "../store/transferSlice";
import { CLUSTER, getExplorerName } from "../utils/consts";

const useStyles = makeStyles((theme) => ({
  tx: {
    marginTop: theme.spacing(1),
    textAlign: "center",
  },
  viewButton: {
    marginTop: theme.spacing(1),
  },
}));

export default function ShowTx({
  chainId,
  tx,
}: {
  chainId: ChainId;
  tx: Transaction;
}) {
  const classes = useStyles();
  const showExplorerLink =
    CLUSTER === "testnet" ||
    (CLUSTER === "devnet" &&
      (chainId === CHAIN_ID_SOLANA));
  const explorerAddress =
    chainId === CHAIN_ID_ETH
      ? `https://${CLUSTER === "testnet" ? "goerli." : ""}etherscan.io/tx/${tx?.id
      }`
      : chainId === CHAIN_ID_BSC
        ? `https://${CLUSTER === "testnet" ? "testnet." : ""}bscscan.com/tx/${tx?.id
        }`
        : chainId === CHAIN_ID_POLYGON
          ? `https://${CLUSTER === "testnet" ? "mumbai." : ""}polygonscan.com/tx/${tx?.id
          }`
          : chainId === CHAIN_ID_AVAX
            ? `https://${CLUSTER === "testnet" ? "testnet." : ""}snowtrace.io/tx/${tx?.id
            }`
            : chainId === CHAIN_ID_OASIS
              ? `https://${CLUSTER === "testnet" ? "testnet." : ""
              }explorer.emerald.oasis.dev/tx/${tx?.id}`
              : chainId === CHAIN_ID_AURORA
                ? `https://${CLUSTER === "testnet" ? "testnet." : ""}aurorascan.dev/tx/${tx?.id
                }`
                : chainId === CHAIN_ID_FANTOM
                  ? `https://${CLUSTER === "testnet" ? "testnet." : ""}ftmscan.com/tx/${tx?.id
                  }`
                  : chainId === CHAIN_ID_CELO
                    ? `https://${CLUSTER === "testnet" ? "alfajores.celoscan.io" : "explorer.celo.org"
                    }/tx/${tx?.id}`
                    : chainId === CHAIN_ID_KARURA
                      ? `https://${CLUSTER === "testnet"
                        ? "blockscout.karura-dev.aca-dev.network"
                        : "blockscout.karura.network"
                      }/tx/${tx?.id}`
                      : chainId === CHAIN_ID_ACALA
                        ? `https://${CLUSTER === "testnet"
                          ? "blockscout.acala-dev.aca-dev.network"
                          : "blockscout.acala.network"
                        }/tx/${tx?.id}`
                        : chainId === CHAIN_ID_SOLANA
                          ? `https://solscan.io/tx/${tx?.id}${CLUSTER === "testnet"
                            ? "?cluster=devnet"
                            : CLUSTER === "devnet"
                              ? "?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899"
                              : ""
                          }`
                          : chainId === CHAIN_ID_MOONBEAM
                            ? `https://${CLUSTER === "testnet" ? "moonbase." : ""}moonscan.io/tx/${tx?.id
                            }`
                            : chainId === CHAIN_ID_BASE
                              ? `https://${CLUSTER === "testnet" ? "goerli." : ""}basescan.org/tx/${tx?.id
                              }`
                              : chainId === CHAIN_ID_XPLA
                                ? `https://explorer.xpla.io/${CLUSTER === "testnet" ? "testnet/" : ""
                                }tx/${tx?.id}`
                                : chainId === CHAIN_ID_ARBITRUM
                                  ? `https://${CLUSTER === "testnet" ? "goerli." : ""}arbiscan.io/tx/${tx?.id
                                  }`
                                  : chainId === CHAIN_ID_NEAR && CLUSTER === "testnet"
                                    ? `https://explorer.testnet.near.org/transactions/${tx?.id}`
                                    : undefined;
  const explorerName = getExplorerName(chainId);

  return (
    <div className={classes.tx}>
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
          className={classes.viewButton}
        >
          View on {explorerName}
        </Button>
      ) : null}
    </div>
  );
}
