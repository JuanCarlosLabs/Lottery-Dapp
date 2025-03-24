export const LOTTERY_ADDRESS = "0x953e223887F951B5DC7286C7880Ca872b231A0fd";

export const LOTTERY_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "vrfCoordinatorV2", "type": "address" },
            { "internalType": "bytes32", "name": "gasLane", "type": "bytes32" },
            { "internalType": "uint256", "name": "subscriptionId", "type": "uint256" },
            { "internalType": "uint32", "name": "callbackGasLimit", "type": "uint32" }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "want", "type": "address" }], "name": "OnlyCoordinatorCanFulfill", "type": "error" },
    { "inputs": [{ "internalType": "address", "name": "have", "type": "address" }, { "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "coordinator", "type": "address" }], "name": "OnlyOwnerOrCoordinator", "type": "error" },
    { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
    { "inputs": [], "name": "ZeroAddress", "type": "error" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "vrfCoordinator", "type": "address" }], "name": "CoordinatorSet", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "message", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "DebugLog", "type": "event" },
    { "anonymous": false, "inputs": [], "name": "NewLotteryStarted", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferRequested", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }], "name": "OwnershipTransferred", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": false, "internalType": "uint256[]", "name": "randomWords", "type": "uint256[]" }], "name": "RequestFulfilled", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": false, "internalType": "uint32", "name": "numWords", "type": "uint32" }], "name": "RequestSent", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "buyer", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "ticketId", "type": "uint256" }], "name": "TicketPurchased", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "WinnerPaid", "type": "event" },
    { "inputs": [], "name": "MAX_TICKETS", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "MAX_TICKETS_PER_WALLET", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "TICKET_PRICE", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "acceptOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "buyTicket", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [], "name": "getCurrentTicketCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "getTicketsByOwner", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "i_subscriptionId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "prizePool", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "randomResults", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "uint256[]", "name": "randomWords", "type": "uint256[]" }], "name": "rawFulfillRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "requestRandomWords", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "s_vrfCoordinator", "outputs": [{ "internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "_vrfCoordinator", "type": "address" }], "name": "setCoordinator", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "vrfCoordinator", "outputs": [{ "internalType": "contract IVRFCoordinatorV2Plus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
];

export const NETWORK_CONFIG = {
    chainId: 11155111, 
    name: "Sepolia",
    currency: "ETH",
    rpcUrl: `https://eth-sepolia.g.alchemy.com/v2/IRdV0GiTcqrL1ThRhLUOo3xQaRZDz4Hp`
};
