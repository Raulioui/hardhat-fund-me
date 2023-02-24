require("@nomicfoundation/hardhat-toolbox");
require('hardhat-deploy');
require("dotenv").config()

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {version: "0.7.0"},
      {version: "0.8.7"},
    ]
  },
  networks: {
    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [
        PRIVATE_KEY
      ],
      chainId: 5,
      blockConfirmations: 6
    },
    hardhat: {
      chainId: 31337,
    }
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },

  namedAccounts: {
    deployer: {
      default: 0,
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
};
