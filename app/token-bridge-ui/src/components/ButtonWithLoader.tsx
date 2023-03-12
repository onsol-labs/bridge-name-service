import {
  Button,
  CircularProgress,
  Typography,
  Box
} from "@mui/material";
import { ReactChild } from "react";

export default function ButtonWithLoader({
  disabled,
  onClick,
  showLoader,
  error,
  children,
}: {
  disabled?: boolean;
  onClick: () => void;
  showLoader?: boolean;
  error?: string;
  children: ReactChild;
}) {
  return (
    <>
      <Box sx={{
        position: "relative",
      }}>
        <Button
          color="primary"
          variant="contained"
          sx={{
            marginTop: 1,
            width: "100%",
          }}
          disabled={disabled}
          onClick={onClick}
        >
          {children}
        </Button>
        {showLoader ? (
          <CircularProgress
            size={24}
            color="inherit"
            sx={{
              position: "absolute",
              bottom: 0,
              left: "50%",
              marginLeft: -12,
              marginBottom: 6,
            }}
          />
        ) : null}
      </Box>
      {error ? (
        <Typography variant="body2" color="error" sx={{
          marginTop: 1,
          textAlign: "center"
        }}>
          {error}
        </Typography>
      ) : null}
    </>
  );
}
