require("dotenv").config();
const hre = require("hardhat");

async function main() {
  console.log("Deploying Lottery contract...");

  const SEPOLIA_VRF_COORDINATOR = "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625"
  const SEPOLIA_GAS_LANE = "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
  const SEPOLIA_SUBSCRIPTION_ID = process.env.SEPOLIA_SUBSCRIPTION_ID;

  if (!SEPOLIA_SUBSCRIPTION_ID) {
    throw new Error("❌ ERROR: SEPOLIA_SUBSCRIPTION_ID no está definido en .env")
  }

  console.log("✅ SEPOLIA_SUBSCRIPTION_ID cargado:", SEPOLIA_SUBSCRIPTION_ID)

  const subscriptionId = SEPOLIA_SUBSCRIPTION_ID.toString();

  if (isNaN(subscriptionId)) {
    throw new Error("❌ ERROR: SEPOLIA_SUBSCRIPTION_ID debe ser un número válido.")
  }

  const CALLBACK_GAS_LIMIT = 5000000
  
  const [deployer] = await hre.ethers.getSigners();
  const OWNER_ADDRESS = deployer.address;

  const Lottery = await hre.ethers.getContractFactory("Lottery");
  const lottery = await Lottery.deploy(
    SEPOLIA_VRF_COORDINATOR,
    SEPOLIA_GAS_LANE,
    subscriptionId,
    CALLBACK_GAS_LIMIT,
  );

  await lottery.waitForDeployment();
  const address = await lottery.getAddress();
  console.log("Lottery deployed to:", address);

  await lottery.deploymentTransaction().wait(5);

  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: address,
    constructorArguments: [
      SEPOLIA_VRF_COORDINATOR,
      SEPOLIA_GAS_LANE,
      SEPOLIA_SUBSCRIPTION_ID,
      CALLBACK_GAS_LIMIT,
    ],
  });

  console.log("Contract verified successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
