import { ChainId } from "@certusone/wormhole-sdk";
import { Link } from "@mui/material";
import { Alert } from "@mui/material";
import { CHAINS_BY_ID } from "../../utils/consts";

const PendingVAAWarning = ({ sourceChain }: { sourceChain: ChainId }) => {
  const chainName = CHAINS_BY_ID[sourceChain]?.name || "unknown";
  const message = `The daily notional value limit for transfers on ${chainName} has been exceeded. As
      a result, the VAA for this transfer is pending. If you have any questions,
      please open a support ticket on `;
  return (
    <Alert variant="outlined" severity="warning" sx={{
      marginTop: 1,
      marginBottom: 1,
    }}>
      {message}
      <Link
        href="https://discord.gg/wormholecrypto"
        target="_blank"
        rel="noopener noreferrer"
      >
        https://discord.gg/wormholecrypto
      </Link>
      {"."}
    </Alert>
  );
};

export default PendingVAAWarning;
