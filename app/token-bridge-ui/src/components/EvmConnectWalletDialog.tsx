import { ChainId } from "@certusone/wormhole-sdk";
import {
  Dialog,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback } from "react";
import {
  Connection,
  ConnectType,
  useEthereumProvider,
} from "../contexts/EthereumProviderContext";
import { getEvmChainId } from "../utils/consts";
import { EVM_RPC_MAP } from "../utils/metaMaskChainParameters";

const WalletOptions = ({
  connection,
  connect,
  onClose,
}: {
  connection: Connection;
  connect: (connectType: ConnectType) => void;
  onClose: () => void;
}) => {

  const handleClick = useCallback(() => {
    connect(connection.connectType);
    onClose();
  }, [connect, connection, onClose]);

  return (
    <ListItem button onClick={handleClick}>
      <ListItemIcon>
        <Box
          component="img"
          src={connection.icon}
          alt={connection.name}
          sx={{
            height: 24,
            width: 24,
          }}
        />
      </ListItemIcon>
      <ListItemText>{connection.name}</ListItemText>
    </ListItem>
  );
};

const EvmConnectWalletDialog = ({
  isOpen,
  onClose,
  chainId,
}: {
  isOpen: boolean;
  onClose: () => void;
  chainId: ChainId;
}) => {
  const { availableConnections, connect } = useEthereumProvider();

  const availableWallets = availableConnections
    .filter((connection) => {
      if (connection.connectType === ConnectType.METAMASK) {
        return true;
      } else if (connection.connectType === ConnectType.BACKPACK) {
        const evmChainId = getEvmChainId(chainId);
        // WalletConnect requires a rpc provider
        return (
          evmChainId !== undefined && EVM_RPC_MAP[evmChainId] !== undefined
        );
      } else if (connection.connectType === ConnectType.WALLETCONNECT) {
        const evmChainId = getEvmChainId(chainId);
        // WalletConnect requires a rpc provider
        return (
          evmChainId !== undefined && EVM_RPC_MAP[evmChainId] !== undefined
        );
      } else {
        return false;
      }
    })
    .map((connection) => (
      <WalletOptions
        connection={connection}
        connect={connect}
        onClose={onClose}
        key={connection.name}
      />
    ));

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>
        <Box sx={{
          display: "flex",
          alignItems: "center",
          "& > div": {
            flexGrow: 1,
            marginRight: 4,
          },
          "& > button": {
            marginRight: -1,
          },
        }}>
          <div>Select your wallet</div>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <List>{availableWallets}</List>
    </Dialog>
  );
};

export default EvmConnectWalletDialog;
