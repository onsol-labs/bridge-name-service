import { ChainId } from "@certusone/wormhole-sdk";
import { Link, Typography } from "@mui/material";
import { Alert } from "@mui/material";
import { useMemo } from "react";
import { CHAIN_CONFIG_MAP } from "../config";

export default function ChainWarningMessage({ chainId }: { chainId: ChainId }) {

  const warningMessage = useMemo(() => {
    return CHAIN_CONFIG_MAP[chainId]?.warningMessage;
  }, [chainId]);

  if (warningMessage === undefined) {
    return null;
  }

  return (
    <Alert variant="outlined" severity="warning" sx={{
      marginTop: 1,
      marginBottom: 1,
    }}>
      {warningMessage.text}
      {
        warningMessage.link ? (
          <Typography component="div">
            <Link href={warningMessage.link.url} target="_blank" rel="noreferrer">
              {warningMessage.link.text}
            </Link>
          </Typography>
        ) : null
      }
    </Alert >
  );
}
