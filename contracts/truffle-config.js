require("dotenv").config({ path: ".env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");
const KLAYHDWalletProvider = require("truffle-hdwallet-provider-klaytn");
const Caver = require("caver-js");

module.exports = {
  contracts_directory: './BNS',
  networks: {
    goerli: {
      provider: () => {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          "https://eth-goerli.g.alchemy.com/v2/KxuaYmRfUODW-qW72TQK7lopOSiGytZc"
        );
      },
      network_id: "5",
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    // test network is the same as development but allows us to omit certain migrations
    test: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*",
    },
    ethereum: {
      provider: () =>
        new HDWalletProvider(process.env.PRIVATE_KEY, "https://rpc.ankr.com/eth"),
      network_id: 1,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: false,
    },
    base_testnet: {
      provider: () => {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          "https://goerli.base.org"
        );
      },
      network_id: 84531,
    },
  },
  compilers: {
    solc: {
      version: "0.8.4",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        },
      },
    },
  },

  plugins: ["@chainsafe/truffle-plugin-abigen", "truffle-plugin-verify"],

  api_keys: {
    etherscan: process.env.ETHERSCAN_KEY,
  },
};