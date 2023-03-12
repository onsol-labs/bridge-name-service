import { Typography } from "@mui/material";
import { ReactChild } from "react";

export default function StepDescription({
  children,
}: {
  children: ReactChild;
}) {
  return (
    <Typography component="div" variant="body2" sx={{ marginBottom: 4 }}>
      {children}
    </Typography>
  );
}
