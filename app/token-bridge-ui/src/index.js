import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, StyledEngineProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { EthereumProviderProvider } from "./contexts/EthereumProviderContext";
import { SolanaWalletProvider } from "./contexts/SolanaWalletContext.tsx";
import ErrorBoundary from "./ErrorBoundary";
import { theme } from "./muiTheme";
import { store } from "./store";
if (!window.localStorage) {
  window.localStorage = require('localstorage-polyfill');
}
if (module.hot) {
  module.hot.accept();
}

ReactDOM.render(
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Provider store={store}>
          <CssBaseline />
          <ErrorBoundary>
            <SnackbarProvider maxSnack={3}>
              <SolanaWalletProvider>
                <EthereumProviderProvider>
                  <BrowserRouter>
                    <App />
                  </BrowserRouter>
                </EthereumProviderProvider>
              </SolanaWalletProvider>
            </SnackbarProvider>
          </ErrorBoundary>
        </Provider>
      </ErrorBoundary>
    </ThemeProvider >
  </StyledEngineProvider>,
  document.getElementById("root")
);
