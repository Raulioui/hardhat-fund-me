const { network } = require("hardhat")
const {networkConfig, developmentChains} = require("../helper-hardhat-config")
const {verify} = require("../utils/verify")

let ethUsdPriceFeedAddress 

// hre
module.exports = async ({ getNamedAccounts, deployments } ) => {
    const chainId = network.config.chainId
    const {deploy, log} = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    }else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    

   const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeedAddress],
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
   })

   if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
    await verify(fundMe.address, [ethUsdPriceFeedAddress])
   }
}   

module.exports.tags = ["all", "fundme"]
