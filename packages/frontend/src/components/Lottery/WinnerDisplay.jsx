import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LOTTERY_ADDRESS, LOTTERY_ABI } from '../../utils/web3Helper';

function WinnerDisplay({ signer }) {
    const [winner, setWinner] = useState(null);
    const [amount, setAmount] = useState('0');

    useEffect(() => {
        if (!signer) return;
        
        const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
        
        contract.on("WinnerSelected", (winnerAddress, prizeAmount) => {
            setWinner(winnerAddress);
            setAmount(ethers.formatEther(prizeAmount));
        });

        return () => {
            contract.removeAllListeners();
        };
    }, [signer]);

    if (!winner) return null;

    return (
        <div className="bg-green-100 border-l-4 border-green-500 p-4 my-4">
            <div className="flex">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3">
                    <p className="text-sm leading-5 text-green-700">
                        Winner Selected!
                    </p>
                    <p className="mt-1 text-sm leading-5 text-green-600">
                        Address: {winner.slice(0, 6)}...{winner.slice(-4)}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-green-600">
                        Prize Amount: {amount} ETH
                    </p>
                </div>
            </div>
        </div>
    );
}

export default WinnerDisplay;
