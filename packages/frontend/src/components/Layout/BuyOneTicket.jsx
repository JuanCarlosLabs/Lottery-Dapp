import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { LOTTERY_ADDRESS, LOTTERY_ABI } from "../../utils/web3Helper";
import { useNotifications } from "./Notifications";

function BuyOneTicket({ signer }) {
    const DEFAULT_PRICE = ethers.parseEther("0.001");
    const [loading, setLoading] = useState(false);
    const [ticketPrice, setTicketPrice] = useState(DEFAULT_PRICE);
    const [hasTicket, setHasTicket] = useState(false);
    const { addNotification } = useNotifications();
    
    useEffect(() => {
        const fetchData = async () => {
            if (!signer) return;
            try {
                const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
                const userAddress = await signer.getAddress();
                
                if (!signer.provider || (await signer.provider.getCode(LOTTERY_ADDRESS)) === "0x") {
                    throw new Error("Contract not deployed or incorrect address");
                }

                const price = await contract.TICKET_PRICE();
                const userTicket = await contract.getTicketsByOwner(userAddress);

                setTicketPrice(price ?? DEFAULT_PRICE);
                setHasTicket(userTicket > 0);
            } catch (error) {
                console.error("Error fetching data:", error);
                setTicketPrice(DEFAULT_PRICE);
            }
        };

        fetchData();

        if (signer) {
            const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
            contract.on("TicketPurchased", fetchData);

            return () => {
                contract.removeAllListeners("TicketPurchased");
            };
        }
    }, [signer]);

    const buyTicket = async () => {
        if (!signer) {
            addNotification("No wallet connected.", "error");
            return;
        }
    
        try {
            const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
            const userAddress = await signer.getAddress();
            console.log("STEP 1: Retrieved user address:", userAddress);
    
            const actualPrice = await contract.TICKET_PRICE();
            console.log("STEP 2: Retrieved ticket price:", ethers.formatEther(actualPrice), "ETH");
    
            const userTicket = await contract.getTicketsByOwner(userAddress);
            console.log("STEP 3: Retrieved user's ticket ID:", userTicket);
    
            const totalTickets = await contract.getCurrentTicketCount();
            console.log("STEP 4: Current number of tickets sold:", totalTickets);

            const subscriptionId = await contract.i_subscriptionId();
            console.log("STEP 5: Chainlink Subscription ID:", subscriptionId.toString());

            const coordinator = await contract.vrfCoordinator();
            console.log("STEP 6: VRF Coordinator Address:", coordinator);
    
            if (Number(userTicket) !== 0) {
                console.log("STEP 7: User already has a ticket. Blocking purchase.");
                addNotification("You already have a ticket for this round.", "error");
                return;
            }
    
            if (totalTickets >= 5) {
                console.log("STEP 8: Max tickets reached. Blocking purchase.");
                addNotification("Lottery is full. Waiting for winner selection.", "error");
                return;
            }
    
            console.log("STEP 9: Sending transaction...");
            setLoading(true);
    
            const tx = await contract.buyTicket({ value: actualPrice });
            console.log("STEP 10: Transaction submitted. Hash:", tx.hash);
            addNotification("Transaction submitted! Buying ticket...", "info");
    
            await tx.wait();
            console.log("STEP 11: Transaction confirmed.");
            addNotification("Successfully bought your ticket!", "success");
    
        } catch (error) {
            console.error("Error buying ticket:", error);
            
            // Captura detalles adicionales del error
            if (error.reason) {
                console.error("Revert reason:", error.reason);
            } else if (error.data) {
                console.error("Revert data:", error.data);
            } else if (error.code) {
                console.error("Error code:", error.code);
            } else {
                console.error("Error details:", error);
}

            addNotification(`Transaction failed: ${error.message || "Unknown error"}`, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 m-4 max-w-sm w-full">
            <h2 className="text-2xl font-bold mb-4">Buy Your Ticket</h2>

            <div className="text-center space-y-4">
                <div className="text-sm text-gray-600">
                    Ticket price: {ticketPrice ? ethers.formatEther(ticketPrice) : "Loading..."} ETH
                </div>

                <button
                    onClick={buyTicket}
                    disabled={loading || hasTicket}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 
                             text-white font-bold py-3 px-4 rounded-lg
                             hover:from-purple-700 hover:to-indigo-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transform transition-all duration-200"
                >
                    {loading ? "Buying..." : hasTicket ? "You Already Have a Ticket" : "Buy Ticket"}
                </button>
            </div>
        </div>
    );
}

export default BuyOneTicket;