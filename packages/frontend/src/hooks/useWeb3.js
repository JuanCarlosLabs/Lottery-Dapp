import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWeb3() {
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [chainId, setChainId] = useState(null);

    useEffect(() => {
        const connectWallet = async () => {
            try {
                let web3Provider;

                if (window.ethereum) {
                    // MetaMask, Brave Wallet, Coinbase Wallet Extension
                    web3Provider = new ethers.BrowserProvider(window.ethereum);
                } else if (window.walletConnectProvider) {
                    // WalletConnect (Trust Wallet, Rainbow Wallet, etc.)
                    web3Provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");
                } else {
                    console.error("❌ No compatible Web3 provider found.");
                    return;
                }

                const accounts = await web3Provider.send("eth_requestAccounts", []);
                const web3Signer = await web3Provider.getSigner();
                const network = await web3Provider.getNetwork();

                setProvider(web3Provider);
                setSigner(web3Signer);
                setAccount(accounts[0]);
                setChainId(network.chainId);

                if (network.chainId !== 11155111) {
                    alert("⚠️ Please switch to the Sepolia network.");
                }

                window.ethereum?.on("accountsChanged", (accounts) => {
                    if (accounts.length === 0) {
                        setAccount(null);
                        setSigner(null);
                    } else {
                        setAccount(accounts[0]);
                    }
                });

                window.ethereum?.on("chainChanged", () => window.location.reload());
            } catch (error) {
                console.error("❌ Error connecting to wallet:", error);
            }
        };

        connectWallet();
    }, []);

    return {
        provider,
        signer,
        account,
        chainId,
        isConnected: !!account,
    };
}
