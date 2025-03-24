import { createContext, useContext, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { LOTTERY_ADDRESS, LOTTERY_ABI } from "../../utils/web3Helper";

const NotificationContext = createContext();

export function useNotifications() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children, signer }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type) => {
        setNotifications(prev => [...prev, { message, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.slice(1));
        }, 4000);
    };

    useEffect(() => {
        if (!signer) return;

        const provider = signer.provider || new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
        const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, provider);

        const handleTicketPurchased = (buyer, ticketId, event) => {
            const timestamp = new Date().toLocaleString();
            addNotification(`🎟️ ${buyer.slice(0, 6)}...${buyer.slice(-4)} bought ticket #${ticketId} at ${timestamp}`, "info");
        };

        const handleWinnerPaid = (winner, amount, event) => {
            const ethAmount = ethers.formatEther(amount);
            const timestamp = new Date().toLocaleString();
            addNotification(`🎉 Winner: ${winner.slice(0, 6)}...${winner.slice(-4)} won ${ethAmount} ETH at ${timestamp}!`, "success");
        };

        contract.on("TicketPurchased", handleTicketPurchased);
        contract.on("WinnerPaid", handleWinnerPaid);

        return () => {
            contract.off("TicketPurchased", handleTicketPurchased);
            contract.off("WinnerPaid", handleWinnerPaid);
        };
    }, [signer]);

    return (
        <NotificationContext.Provider value={{ addNotification }}>
            {children}
            <div className="fixed left-0 top-0 p-4 w-80 space-y-3">
                <AnimatePresence>
                    {notifications.map((notification, index) => (
                        <motion.div
                            key={index}
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -300, opacity: 0 }}
                            className={`p-3 rounded-lg text-white shadow-lg ${notification.type === "success" ? "bg-green-500" : "bg-blue-500"}`}
                        >
                            {notification.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}