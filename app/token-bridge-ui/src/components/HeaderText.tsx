import { Typography, Box } from "@mui/material";
import { ReactNode } from "react";

export default function HeaderText({
  children,
  white,
  small,
  subtitle,
}: {
  children: ReactNode;
  white?: boolean;
  small?: boolean;
  subtitle?: ReactNode;
}) {
  return (
    <Box sx={(theme) => ({
      marginBottom: theme.spacing(4),
      textAlign: "center",
      width: "100%",
    })}>
      <Typography
        variant={small ? "h2" : "h1"}
        component="h1"
        sx={(!white) ? {
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          WebkitTextFillColor: "transparent",
          MozBackgroundClip: "text",
          MozTextFillColor: "transparent",
        } : {}}
      >
        {children}
      </Typography>
      {subtitle ? (
        <Typography component="div" sx={(theme) => ({
          marginTop: theme.spacing(2),
        })}>
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}
