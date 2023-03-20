// src/componetns/Footer.tsx

import React, { FC, ReactElement } from "react";
import { Box, Button, Container, Grid, Link, Typography } from "@mui/material";
import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

export const Footer: FC = (): ReactElement => {
  return (
    <Box
      sx={{
        width: "100%",
        height: "auto",
        paddingTop: "1rem",
        paddingBottom: "1rem",
        marginTop: "1rem",
      }}
    >
      <Container maxWidth="lg">
        <Grid container direction="column" alignItems="center">


          <Grid item xs={12} sx={{ my: 0.5 }}>

            <Button
              href="https://twitter.com/ANSProtocol"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                fontSize: '1em'
              }}
            >
              <FaTwitter />
            </Button>

            <Button
              href="https://discord.gg/AJK53MMd7K"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                fontSize: '1em'
              }}
            >
              <FaDiscord />
            </Button>

            <Button
              href="https://github.com/onsol-labs/bridge-name-service/"
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              sx={{
                fontSize: '1em'
              }}
            >
              <FaGithub />
            </Button>
          </Grid>

          <Grid item xs={12} sx={{ my: 0.5 }}>
            made with ❤️ by{" "}
            <Link
                href="https://twitter.com/onsol_labs"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  fontSize: '1em',
                  fontWeight: "bold"
                }}
              >
                Onsol Labs
              </Link>
          </Grid>

          <Grid item xs={12} sx={{ my: 0.5 }}>
            <Typography color="textSecondary" variant="subtitle1">
              Powered by {" "}
              <Link
                href="https://twitter.com/ANSProtocol"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  fontSize: '1em',
                  fontWeight: "bold"
                }}
              >
                ANS Protocol
              </Link>{" & "}
              <Link
                href="https://twitter.com/wormholecrypto"
                target="_blank"
                rel="noopener noreferrer"
                color="inherit"
                sx={{
                  fontSize: '1em',
                  fontWeight: "bold"
                }}
              >Wormhole</Link>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;