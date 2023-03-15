import { Button, Typography, Box } from "@mui/material";

export default function Footer() {
  return (
    <Box component="footer" sx={(theme) => ({
      textAlign: "center",
      borderTop: "1px solid #585587",
      position: "relative",
      maxWidth: 1100,
      margin: "80px auto 0px",
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(6.5),
      [theme.breakpoints.up("md")]: {
        paddingBottom: theme.spacing(12),
      },
    })}>
      <Typography variant="body2" gutterBottom>
        hello there
      </Typography>

      {/* <Button
        variant="outlined"
        href="https://wormhole.com/"
        target="_blank"
        rel="noopener noreferrer"
        color="inherit"
        sx={(theme) => ({
          textTransform: "none",
          margin: theme.spacing(1),
        })}
      >
        {" "}
        Wormhole
      </Button>

      <Button
        variant="outlined"
        href="https://github.com/wormhole-foundation/wormhole"
        target="_blank"
        rel="noopener noreferrer"
        color="inherit"
        sx={(theme) => ({
          textTransform: "none",
          margin: theme.spacing(1),
        })}
      >
        {" "}
        Github
      </Button> */}
    </Box>
  );
}
