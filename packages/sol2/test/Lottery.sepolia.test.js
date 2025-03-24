require("dotenv").config();
const { expect } = require("chai");
const { ethers } = require("hardhat");

const VRF_COORDINATOR = "0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B";
const KEY_HASH = "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae";
const SUBSCRIPTION_ID = process.env.SEPOLIA_SUBSCRIPTION_ID;
const CALLBACK_GAS_LIMIT = 250000;

const ticketPrice = ethers.parseEther("0.001");

describe("Lottery Contract (Testnet: Sepolia, Chainlink VRF v2.5)", function () {
  let lottery;
  let deployer;

  before(async function () {
    // Get the Hardhat account (only one address will interact with the contract)
    [deployer] = await ethers.getSigners();

    // Ensure deployer has enough ETH to cover transactions
    const deployerBalance = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer balance:", ethers.formatEther(deployerBalance), "ETH");

    if (deployerBalance < ethers.parseEther("0.1")) {
      throw new Error("❌ Deployer has insufficient ETH. Fund it via: https://faucets.chain.link/sepolia");
    }

    console.log("Deploying Lottery to Sepolia using real Chainlink v2.5...");
    const Lottery = await ethers.getContractFactory("Lottery");
    lottery = await Lottery.deploy(VRF_COORDINATOR, KEY_HASH, SUBSCRIPTION_ID, CALLBACK_GAS_LIMIT);
    await lottery.waitForDeployment();

    const address = await lottery.getAddress();
    console.log("Lottery deployed to:", address);
    require("fs").writeFileSync("latest-contract.txt", address);

    console.log("⚠️ Add this contract as a consumer in Chainlink VRF:");
    console.log(`👉 https://vrf.chain.link/sepolia/subscriptions/${SUBSCRIPTION_ID}`);

    // Add contract as consumer if permitted
    const vrfCoordinatorAbi = ["function addConsumer(uint256 subId, address consumer) external"];
    const vrfCoordinator = new ethers.Contract(VRF_COORDINATOR, vrfCoordinatorAbi, deployer);
    try {
      const tx = await vrfCoordinator.addConsumer(SUBSCRIPTION_ID, address);
      await tx.wait();
      console.log("✅ Contract added as a consumer.");
    } catch (err) {
      console.warn("⚠️ Could not add consumer automatically. Are you the subscription owner?");
    }
  });

  it("should simulate a full lottery cycle with Chainlink VRF v2.5", async function () {
    this.timeout(180000); // Allow time for Chainlink VRF

    // Buy all tickets using the same deployer account
    async function buyTicket(index) {
      console.log(`STEP ${index + 1}: Buying a ticket...`);
      const tx = await lottery.connect(deployer).buyTicket({ value: ticketPrice, gasLimit: 300000 });
      await tx.wait();
      console.log(`✅ Ticket purchased. 🎟️ Tickets sold: ${await lottery.getCurrentTicketCount()}`);
    }

    // Buy 5 tickets (triggers VRF on the last one)
    for (let i = 0; i < 5; i++) {
      await buyTicket(i);
    }

    // Validate that randomness request was triggered
    const events = await lottery.queryFilter("RequestSent");
    if (!events.length) {
      throw new Error("❌ No RequestSent event found. Ensure the contract is added as a Chainlink consumer.");
    }

    const requestId = events[events.length - 1].args.requestId;
    console.log(`🔗 Randomness requested. Request ID: ${requestId}`);
    console.log("⏳ Waiting for Chainlink VRF (~30-90 seconds)...");

    console.log("⏳ Waiting for WinnerPaid event...");

    // Wait for the WinnerPaid event (poll every 5 sec for up to 2 minutes)
    let winnerPaidEvent;
    for (let i = 0; i < 24; i++) {
      const events = await lottery.queryFilter("WinnerPaid", "latest");
      if (events.length > 0) {
        winnerPaidEvent = events[events.length - 1];
        break;
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    if (!winnerPaidEvent || !winnerPaidEvent.args) {
      console.error("❌ WinnerPaid event not found.");
      const logs = await lottery.queryFilter("*", "latest");
      logs.forEach(log => {
        console.log(`📜 Event: ${log.event}`);
        if (log.args) {
          console.log(" - args:", log.args);
        }
      });
      throw new Error("❌ WinnerPaid event not detected in logs.");
    }

    // Display the winner and prize
    const winner = winnerPaidEvent.args[0];
    const amount = winnerPaidEvent.args[1];
    console.log(`🏆 Winner: ${winner}`);
    console.log(`💰 Prize: ${ethers.formatEther(amount)} ETH`);
  });
});