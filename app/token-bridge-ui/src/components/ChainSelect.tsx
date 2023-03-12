import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  OutlinedTextFieldProps,
  TextField,
  Box
} from "@mui/material";
import clsx from "clsx";
import { ChainInfo } from "../utils/consts";

const createChainMenuItem = ({ id, name, logo }: ChainInfo) => (
  <MenuItem key={id} value={id}>
    <ListItemIcon sx={{ minWidth: 40 }}>
      <Box component="img" src={logo} alt={name} sx={{
        height: 24,
        maxWidth: 24,
      }} />
    </ListItemIcon>
    <ListItemText>{name}</ListItemText>
  </MenuItem>
);

interface ChainSelectProps extends OutlinedTextFieldProps {
  chains: ChainInfo[];
}

export default function ChainSelect({ chains, ...rest }: ChainSelectProps) {

  return (
    <TextField {...rest}
      sx={({
        ...{
          "& .MuiSelect-root": {
            display: "flex",
            alignItems: "center",
          }
        },
      })
      }
    // className={clsx(classes.select, rest.className)}
    >
      {chains.map((chain) => createChainMenuItem(chain))}
    </TextField>
  );
}
