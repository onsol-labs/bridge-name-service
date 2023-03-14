import {
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function RefreshButtonWrapper({
  children,
  callback,
}: {
  children: JSX.Element;
  callback: () => any;
}) {

  const refreshWrapper = (
    <Box sx={{
      "& > *": {
        margin: ".5rem",
      },
      display: "flex",
      alignItems: "center",
    }}>
      <Box sx={{
        display: "inline-block",
        flexGrow: 1,
      }}>{children}</Box>
      <Tooltip title="Reload Tokens">
        <IconButton onClick={callback} size="large">
          <RefreshIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );

  return refreshWrapper;
}
