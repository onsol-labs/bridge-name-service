require("dotenv").config({ path: ".env" });
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  contracts_directory: './BNS',
  networks: {
    goerli: {
      provider: () => {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,
          "https://goerli.infura.io/v3/576a4181b38c475aa545b5a0f7458acf"
        );
      },
      network_id: "5",
      // gasPrice: "56000000000",
      // skipDryRun: true,
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
        new HDWalletProvider(process.env.PRIVATE_KEY, 
          "https://mainnet.infura.io/v3/576a4181b38c475aa545b5a0f7458acf"),
      network_id: 1,
      confirmations: 1,
      timeoutBlocks: 200,
      skipDryRun: false,
      gas: "1500582",
      gasPrice: "40000000000",
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