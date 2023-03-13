import { Typography } from "@mui/material";
import { ReactNode } from "react";

export default function StepDescription({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Typography component="div" variant="body2" sx={{ marginBottom: 4 }}>
      {children}
    </Typography>
  );
}
