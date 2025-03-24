require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_BASE_URL = "https://api-sepolia.etherscan.io/api";

const eventSignatures = {
  RequestFulfilled: "0x6fdfb9cbb6a045315a15e2a76e4ac6e02a2e08a4e8d98a1d22d50cf23f667b6a",
  WinnerPaid: "0xa99aa7bc53e95e8e96a67cf5c31635de7452d8c0fbd2b3e2f5610d22c365ba99"
};

async function getEvents(address, eventSignature) {
  const url = `${ETHERSCAN_BASE_URL}?module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${address}&topic0=${eventSignature}&apikey=${ETHERSCAN_API_KEY}`;
  const response = await axios.get(url);
  return response.data.result;
}

(async () => {
  if (!fs.existsSync("latest-contract.txt")) {
    console.error("❌ No se encontró el archivo 'latest-contract.txt'. Ejecuta primero el test.");
    process.exit(1);
  }

  const contractAddress = fs.readFileSync("latest-contract.txt", "utf-8").trim();
  console.log(`🔍 Consultando eventos en contrato desplegado: ${contractAddress}`);

  for (const [name, sig] of Object.entries(eventSignatures)) {
    console.log(`\n📘 Evento ${name}:`);
    try {
      const logs = await getEvents(contractAddress, sig);
      if (!logs.length) {
        console.log("⚠️ No se encontraron eventos.");
        continue;
      }

      logs.slice(-10).forEach((log, i) => {
        console.log(`#${i + 1}: txHash: ${log.transactionHash}, block: ${log.blockNumber}`);
      });
    } catch (err) {
      console.error(`❌ Error al obtener ${name}:`, err.message);
    }
  }
})();