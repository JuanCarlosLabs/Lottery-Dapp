import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { LOTTERY_ADDRESS, LOTTERY_ABI } from '../../utils/web3Helper';

function PrizePool({ signer }) {
    const [prizePool, setPrizePool] = useState('0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrizePool = async () => {
            if (!signer) return;
            try {
                const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);
                const pool = await contract.prizePool();
                setPrizePool(ethers.formatEther(pool));
            } catch (error) {
                console.error('Error fetching prize pool:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrizePool();
    }, [signer]);

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2">Current Prize Pool</h2>
                    {loading ? (
                        <div className="animate-pulse flex justify-center items-center space-x-2">
                            <div className="h-8 w-24 bg-gray-200 rounded"></div>
                            <div className="h-8 w-12 bg-gray-200 rounded"></div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-baseline space-x-2">
                            <span className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                {prizePool}
                            </span>
                            <span className="text-2xl font-semibold text-gray-600">ETH</span>
                        </div>
                    )}
                    <p className="mt-4 text-gray-600">
                        Join the lottery for a chance to win the entire prize pool!
                    </p>
                </div>
            </div>
        </div>
    );
}

export default PrizePool;
