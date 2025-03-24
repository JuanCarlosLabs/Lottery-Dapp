import { useWeb3 } from '../../context/Web3Context';

function ConnectWallet() {
  const { account, connectWallet } = useWeb3();

  return (
    <button
      onClick={connectWallet}
      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 
                     text-white font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg 
                     transform hover:-translate-y-0.5 transition-all duration-200"
    >
      {account 
        ? `${account.slice(0, 6)}...${account.slice(-4)}`
        : 'Connect Wallet'
      }
    </button>
  );
}

export default ConnectWallet;
