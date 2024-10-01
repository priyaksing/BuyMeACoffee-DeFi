// scripts/withdraw.js

const hre = require("hardhat");
const abi = require("../artifacts/contracts/BuyMeACoffee.sol/BuyMeACoffee.json");

async function getBalance(provider, address) {
    const balanceBigInt = await provider.getBalance(address);
    return hre.ethers.formatEther(balanceBigInt);
}

async function main() {
    // Get the contract that has been deployed to Goerli.
    const contractAddress = "0x4cb854E239094Dfd599959B40fF4377512d06D90";
    const contractABI = abi.abi;

    // Get the node connection and wallet connection.
    const provider = new hre.ethers.JsonRpcProvider(process.env.SEPOLIA_URL);

    // Ensure that signer is the SAME address as the original contract deployer,
    // or else this script will fail with an error.
    const signer = new hre.ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // Instantiate connected contract.
    const buyMeACoffee = new hre.ethers.Contract(contractAddress, contractABI, signer);

    // Check starting balances.
    console.log("Current balance of Owner: ", await getBalance(provider, signer.getAddress()), "ETH");
    const contractBalance = await getBalance(provider, buyMeACoffee.getAddress());
    console.log("Current balance of Contract: ", await getBalance(provider, buyMeACoffee.getAddress()), "ETH");

    // Withdraw funds if there are funds to withdraw.
    if (contractBalance !== "0.0") {
        console.log("Withdrawing funds..")
        const withdrawTxn = await buyMeACoffee.withdrawCoffee();
        await withdrawTxn.wait();
    } else {
        console.log("No funds to withdraw!");
    }

    // Check ending balance.
    console.log("Current balance of Owner: ", await getBalance(provider, signer.getAddress()), "ETH");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    });