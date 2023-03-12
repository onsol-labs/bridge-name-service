import { Button, Tooltip, Box } from "@mui/material";
import { LinkOff } from "@mui/icons-material";

const ToggleConnectedButton = ({
  connect,
  disconnect,
  connected,
  pk,
  walletIcon,
}: {
  connect(): any;
  disconnect(): any;
  connected: boolean;
  pk: string;
  walletIcon?: string;
}) => {
  const is0x = pk.startsWith("0x");
  return connected ? (
    <Tooltip title={pk}>
      <Button
        color="primary"
        variant="outlined"
        size="small"
        onClick={disconnect}
        sx={{
          display: "flex",
          margin: `1px auto`,
          width: "100%",
          maxWidth: 400,
        }}
        startIcon={
          walletIcon ? (
            <Box component="img" sx={{
              height: 24,
              width: 24,
            }} src={walletIcon} alt="Wallet" />
          ) : (
            <LinkOff />
          )
        }
      >
        Disconnect {pk.substring(0, is0x ? 6 : 3)}...
        {pk.substr(pk.length - (is0x ? 4 : 3))}
      </Button>
    </Tooltip>
  ) : (
    <Button
      color="primary"
      variant="contained"
      size="small"
      onClick={connect}
      sx={{
        display: "flex",
        margin: `1px auto`,
        width: "100%",
        maxWidth: 400,
      }}
    >
      Connect
    </Button>
  );
};

export default ToggleConnectedButton;
