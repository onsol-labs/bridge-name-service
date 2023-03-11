import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TokenInfo } from "@solana/spl-token-registry";
import { RelayerTokenInfo } from "../hooks/useRelayersAvailable";
import {
  DataWrapper,
  errorDataWrapper,
  fetchDataWrapper,
  getEmptyDataWrapper,
  receiveDataWrapper,
} from "./helpers";

export interface TokenMetadataState {
  solanaTokenMap: DataWrapper<TokenInfo[]>;
  relayerTokenInfo: DataWrapper<RelayerTokenInfo>;
}

const initialState: TokenMetadataState = {
  solanaTokenMap: getEmptyDataWrapper(),
  relayerTokenInfo: getEmptyDataWrapper(),
};

export const tokenSlice = createSlice({
  name: "tokenInfos",
  initialState,
  reducers: {
    receiveSolanaTokenMap: (state, action: PayloadAction<TokenInfo[]>) => {
      state.solanaTokenMap = receiveDataWrapper(action.payload);
    },
    fetchSolanaTokenMap: (state) => {
      state.solanaTokenMap = fetchDataWrapper();
    },
    errorSolanaTokenMap: (state, action: PayloadAction<string>) => {
      state.solanaTokenMap = errorDataWrapper(action.payload);
    },

    receiveRelayerTokenInfo: (
      state,
      action: PayloadAction<RelayerTokenInfo>
    ) => {
      state.relayerTokenInfo = receiveDataWrapper(action.payload);
    },
    fetchRelayerTokenInfo: (state) => {
      state.relayerTokenInfo = fetchDataWrapper();
    },
    errorRelayerTokenInfo: (state, action: PayloadAction<string>) => {
      state.relayerTokenInfo = errorDataWrapper(action.payload);
    },

    reset: () => initialState,
  },
});

export const {
  receiveSolanaTokenMap,
  fetchSolanaTokenMap,
  errorSolanaTokenMap,
  receiveRelayerTokenInfo,
  fetchRelayerTokenInfo,
  errorRelayerTokenInfo,
  reset,
} = tokenSlice.actions;

export default tokenSlice.reducer;
