import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

export const Web3Context = createContext();

export function Web3Provider({ children }) {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [chainId, setChainId] = useState(null);

    const connectWallet = async () => {
        try {
            if (window.ethereum) {
                const provider = new ethers.BrowserProvider(window.ethereum);
                setProvider(provider);
                
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                setAccount(accounts[0]);
                
                const signer = await provider.getSigner();
                setSigner(signer);
                
                const network = await provider.getNetwork();
                setChainId(network.chainId);
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                setAccount(accounts[0]);
            });
            window.ethereum.on("chainChanged", (chainId) => {
                window.location.reload();
            });
        }
    }, []);

    return (
        <Web3Context.Provider 
            value={{ 
                account, 
                provider,
                signer, 
                chainId,
                connectWallet 
            }}
        >
            {children}
        </Web3Context.Provider>
    );
}

export const useWeb3 = () => useContext(Web3Context);
