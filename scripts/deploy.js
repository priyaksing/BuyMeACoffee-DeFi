const hre = require("hardhat");

// BuyMeACoffee deployed to:  0x4cb854E239094Dfd599959B40fF4377512d06D90

async function main() {
    const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");
    const buyMeACoffee = await BuyMeACoffee.deploy();
    await buyMeACoffee.waitForDeployment();
    console.log("BuyMeACoffee deployed to: ", await buyMeACoffee.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });