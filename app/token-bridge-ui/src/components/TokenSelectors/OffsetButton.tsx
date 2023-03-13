import { Button} from "@mui/material";
import { ReactNode } from "react";

export default function OffsetButton({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outlined"
      sx={{
        display: "block",
        marginLeft: "auto",
        marginTop: 8
      }}
    >
      {children}
    </Button>
  );
}
