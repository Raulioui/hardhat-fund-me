const {deployments, ethers, getNamedAccounts, network} = require("hardhat")
const {assert, expect} = require("chai")
const { developmentChains } = require("../../../helper-hardhat-config") 

!developmentChains.includes(network.name) ?

    describe.skip :

    describe("FundMe", () => {
        let fundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1")
        beforeEach( async function () {
            deployer = (await getNamedAccounts()).deployer
            await deployments.fixture(["all"])
            fundMe = await ethers.getContract("FundMe", deployer)
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
        })

        describe("constructor", function() {
            it("sets the aggregator addresses correctly", async function() {
                const response = await fundMe.getPriceFeed()
                assert.equal(response, mockV3Aggregator.address)
            })
        })

        describe("fund", async function() {

            it("falis if you don't send enought eth", async function() {
                await expect(fundMe.fund()).to.be.revertedWith(
                    "You need to spend more ETH!"
                )
            })

            it("update the amount of money sending", async function(){
                await fundMe.fund({value: sendValue})
                const response = await fundMe.getAddressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())
            })

            it("push the funder to the array", async function() {
                await fundMe.fund({value: sendValue})
                const funder = await fundMe.getFunder(0)
                assert.equal(funder, deployer)
            })
        })

        describe("withdraw",  function(){

            beforeEach(async function(){
                await fundMe.fund({value: sendValue})
            })

            it("withdraw eth from a single founder", async function(){
                const startingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const startingFounderBalance = await fundMe.provider.getBalance(deployer)

                const response = await fundMe.withdraw()
                const responseReceipt = await response.wait(1)
                const {gasUsed, effectiveGasPrice} = responseReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
                const endingFounderBalance = await fundMe.provider.getBalance(deployer)

                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance.add(startingFounderBalance).toString(),
                    endingFounderBalance.add(gasCost).toString()
                )
            })
            it("Allows us to withdraw with munltiple funders", async function(){
                const accounts = await ethers.getSigners()
                for (i = 1; i < 6; i++) {
                    const fundMeConnectedContract = await fundMe.connect(
                        accounts[i]
                    )
                    await fundMeConnectedContract.fund({ value: sendValue })
                }
                const startingFundMeBalance =
                    await fundMe.provider.getBalance(fundMe.address)
                const startingDeployerBalance =
                    await fundMe.provider.getBalance(deployer)

                // Act
                const transactionResponse = await fundMe.withdraw()
                // Let's comapre gas costs :)
                // const transactionResponse = await fundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait()
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const withdrawGasCost = gasUsed.mul(effectiveGasPrice)
                console.log(`GasCost: ${withdrawGasCost}`)
                console.log(`GasUsed: ${gasUsed}`)
                console.log(`GasPrice: ${effectiveGasPrice}`)
                const endingFundMeBalance = await fundMe.provider.getBalance(
                    fundMe.address
                )
                const endingDeployerBalance =
                    await fundMe.provider.getBalance(deployer)
                // Assert
                assert.equal(
                    startingFundMeBalance
                        .add(startingDeployerBalance)
                        .toString(),
                    endingDeployerBalance.add(withdrawGasCost).toString()
                )
                // Make a getter for storage variables
            

            })
        })
    })
