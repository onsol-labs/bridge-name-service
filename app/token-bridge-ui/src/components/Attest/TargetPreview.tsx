import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { selectAttestTargetChain } from "../../store/selectors";
import { CHAINS_BY_ID } from "../../utils/consts";

export default function TargetPreview() {
  const targetChain = useSelector(selectAttestTargetChain);

  const explainerString = `to ${CHAINS_BY_ID[targetChain].name}`;

  return (
    <Typography
      component="div"
      variant="subtitle2"
      sx={{
        textAlign: "center",
      }}
    >
      {explainerString}
    </Typography>
  );
}
