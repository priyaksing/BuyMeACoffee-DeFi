// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

// function to retrieve the balance of address sent as parameter
async function getBalance(address) {
  const balanceBigInt = await hre.ethers.provider.getBalance(address);
  return await hre.ethers.formatEther(balanceBigInt);
}

// function to display the balance of addresses sent as parameters
async function displayBalance(addresses) {
  let i = 0;
  for (const address of addresses) {
    console.log(`For ${i} Address: Balance is : `, await getBalance(address));
    i++;
  }
}

// function to print the memos in the console
async function printMemos(memos) {
  for (const memo of memos) {
    const tipperAddress = memo.from;
    const tipper = memo.name;
    const timestamp = memo.timestamp;
    const message = memo.message;

    console.log(`At ${timestamp}, ${tipper} (${tipperAddress}) said: "${message}"`);
  }
}

async function main() {
  // Get example accounts
  const [owner, tipper, tipper2, tipper3] = await hre.ethers.getSigners();

  // Get contract to deploy
  const BuyMeACoffee = await hre.ethers.getContractFactory("BuyMeACoffee");

  // Deploy the contract
  const buyMeACoffee = await BuyMeACoffee.deploy();
  await buyMeACoffee.waitForDeployment();
  console.log(`BuyMeACoffee deployed to : `, await buyMeACoffee.getAddress());

  // Check balance before coffee purchase
  const addresses = [owner.address, tipper.address, await buyMeACoffee.getAddress()];
  console.log("-- START --");
  await displayBalance(addresses);

  // Buy a few coffees for the owner
  const tip = { value: hre.ethers.parseEther("1") };
  await buyMeACoffee.connect(tipper).buyCoffee("Tony", "Love you 3000", tip);
  await buyMeACoffee.connect(tipper2).buyCoffee("Natasha", "Great work :)", tip);
  await buyMeACoffee.connect(tipper3).buyCoffee("Banner", "Amazinggg!", tip);

  // Check balance after coffee purchase
  console.log("-- BOUGHT COFFEE --");
  await displayBalance(addresses);

  // Withdraw funds
  await buyMeACoffee.connect(owner).withdrawCoffee();

  // Check balance after withdrawal
  console.log("-- WITHDRAWN COFFEE --");
  await displayBalance(addresses);

  // Read the memos left for the owner
  console.log("-- MEMOS --");
  const memos = await buyMeACoffee.getMemos();
  await printMemos(memos);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
