import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LOTTERY_ADDRESS, LOTTERY_ABI } from "../../utils/web3Helper";

function WinnersHistory({ signer }) {
    const [history, setHistory] = useState([]);
    const [ticketCount, setTicketCount] = useState(0);
    const [maxTickets, setMaxTickets] = useState(5);
    const [prizePool, setPrizePool] = useState("0");

    useEffect(() => {
        if (!signer) return;

        const provider = signer.provider || new ethers.JsonRpcProvider("https://eth-sepolia.g.alchemy.com/v2/IRdV0GiTcqrL1ThRhLUOo3xQaRZDz4Hp");
        const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);
        console.log("Contrato Cargado: ", contract);
        const fetchHistory = async () => {
            try {
                console.log("Fetching full history...");
                
                // Obtener eventos desde el bloque 0 para capturar todo el historial
                const ticketEvents = await contract.queryFilter(contract.filters.TicketPurchased(), 0, "latest");
                const winnerEvents = await contract.queryFilter(contract.filters.WinnerPaid(), 0, "latest");
                
                console.log("Total Ticket Events:", ticketEvents.length);
                console.log("Total Winner Events:", winnerEvents.length);

                // Procesar compras de boletos
                const ticketDetails = await Promise.all(ticketEvents.map(async (event) => {
                    const block = await provider.getBlock(event.blockNumber);
                    return {
                        type: "purchase",
                        address: event.args.buyer,
                        ticketId: event.args.ticketId.toString(),
                        timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                    };
                }));

                // Procesar pagos a ganadores
                const winnerDetails = await Promise.all(winnerEvents.map(async (event) => {
                    const block = await provider.getBlock(event.blockNumber);
                    return {
                        type: "winner",
                        address: event.args.winner,
                        amount: ethers.formatEther(event.args.amount),
                        timestamp: new Date(block.timestamp * 1000).toLocaleString(),
                    };
                }));

                // Combinar y ordenar eventos
                const fullHistory = [...ticketDetails, ...winnerDetails].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                
                console.log("Updated history:", fullHistory);
                setHistory(fullHistory);
            } catch (error) {
                console.error("Error fetching history:", error);
            }
        };

        const fetchLotteryState = async () => {
            try {
                console.log("📡 Obteniendo estado de la lotería...");
                
                const ticketsSold = await contract.getCurrentTicketCount();
                const maxTicketsAllowed = await contract.MAX_TICKETS();
                const currentPrizePool = await contract.prizePool();
        
                console.log("✅ Tickets vendidos:", ticketsSold);
                console.log("✅ Máximo de tickets:", maxTicketsAllowed);
                console.log("✅ Prize Pool:", currentPrizePool, "ETH");
        
                setTicketCount(Number(ticketsSold));
                setMaxTickets(Number(maxTicketsAllowed));
                setPrizePool(ethers.formatEther(currentPrizePool));
            } catch (error) {
                console.error("❌ Error obteniendo el estado de la lotería:", error);
            }
        };
        

        fetchHistory();
        fetchLotteryState();

        contract.on("TicketPurchased", fetchHistory);
        contract.on("WinnerPaid", fetchHistory);
        contract.on("TicketPurchased", fetchLotteryState);
        contract.on("WinnerPaid", fetchLotteryState);

        return () => {
            contract.removeAllListeners("TicketPurchased");
            contract.removeAllListeners("WinnerPaid");
        };
    }, [signer]);

    return (
        <div className="p-6 m-4 max-w-md w-full">
            <div className="bg-blue-100 rounded-2xl shadow-xl p-4 mb-4 text-center">
                <h2 className="text-2xl font-bold">Lottery Status</h2>
                <p className="text-lg">Tickets Sold: {ticketCount} / {maxTickets}</p>
                <p className="text-lg">Prize Pool: {prizePool} ETH</p>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-4">Lottery History</h2>
                {history.length === 0 ? (
                    <div className="text-center text-gray-600">No activity yet.</div>
                ) : (
                    <ul className="space-y-2">
                        {history.map((entry, index) => (
                            <li key={index} className={`p-2 rounded-lg ${entry.type === "winner" ? "bg-green-200 text-green-800 font-bold text-lg" : "bg-gray-100 text-gray-700"}`}>
                                <span className="font-mono">{entry.address.slice(0, 6)}...{entry.address.slice(-4)}</span>
                                {entry.type === "purchase" ? (
                                    <span> bought ticket #{entry.ticketId}</span>
                                ) : (
                                    <span> 🎉 Winner! {entry.amount} ETH</span>
                                )}
                                <span className="block text-sm text-gray-500">{entry.timestamp}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default WinnersHistory;
