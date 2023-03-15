import {
  AppBar,
  Box,
  Button,
  Container,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@mui/material";
import { useCallback } from "react";
import { useLocation } from "react-router";
import { Link, Redirect, Route, Switch } from "react-router-dom";
import Footer from "./components/Footer";
import HeaderText from "./components/HeaderText";
import NFT from "./components/NFT";
import NFTOriginVerifier from "./components/NFTOriginVerifier";
import Recovery from "./components/Recovery";
import { CLUSTER } from "./utils/consts";

function App() {
  const { pathname } = useLocation();
  const handleClusterChange = useCallback((event) => {
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("cluster", event.target.value);
    window.location.search = urlParams;
  }, []);
  return (
    <Box sx={{
      // background:
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      position: "relative",
      overflow: "hidden",
    }}>
      {
        <AppBar position="static" elevation={0} style={{ marginBottom: 40 }}>
          <Toolbar variant="dense">
            <Button component={Link} to="/">
              Bridge
            </Button>
            <Button component={Link} to="/redeem">
              Redeem
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <Select
              value={CLUSTER}
              onChange={handleClusterChange}
              variant="outlined"
              margin="dense"
            >
              <MenuItem value="mainnet">Mainnet</MenuItem>
              <MenuItem value="testnet">Devnet</MenuItem>
            </Select>
          </Toolbar>
        </AppBar>
      }
      {["/", "/redeem"].includes(pathname) ? (
        <Container maxWidth="md" style={{ paddingBottom: 24 }}>
          <HeaderText
            white
            subtitle={
              <>
                <Typography>
                  This is an experimental ENS domain bridge that transfers
                  ENS domains across Solana and Ethereum.
                </Typography>
                <Typography sx={{ marginTop: 0.5}}>
                - powered by ANS Protocol and Wormhole -
              </Typography>
              </>
            }
          >
      .bridge
    </HeaderText>
        </Container >
      ) : null
}
      <Switch>
        <Route exact path="/">
          <NFT />
        </Route>
        <Route exact path="/redeem">
          <Recovery />
        </Route>
        <Route exact path="/nft-origin-verifier">
          <NFTOriginVerifier />
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
      <Box sx={{
        flex: 1,
        width: "100vw",
      }} />
      <Box></Box>
      <Box></Box>
      <Box></Box>
      <Box></Box>
      <Footer />
    </Box >
  );
}

export default App;
