const hre = require("hardhat");

// BuyMeACoffee deployed to:  0xc2C68D92df7be3e4918Fc5690FA81B074C177515

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