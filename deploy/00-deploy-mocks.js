const { network } = require("hardhat")
const {developmentChains, DECIMALS, INITIAL_ANSWER} = require("../helper-hardhat-config")

module.exports = async ({ getNamedAccounts, deployments } ) => {
    const {deploy, log} = deployments
    const { deployer } = await getNamedAccounts()

    if(developmentChains.includes(network.name)){
        log("Local network detected, deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            log: true,
            from: deployer,
            args: [DECIMALS, INITIAL_ANSWER]
        })
        log("Mocks deployed")
    }
}   

module.exports.tags = ["all", "mocks"]