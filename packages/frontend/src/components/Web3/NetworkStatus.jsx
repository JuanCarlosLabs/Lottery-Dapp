import { useWeb3 } from '../../context/Web3Context';

function NetworkStatus() {
    const { chainId } = useWeb3();

    const getNetworkInfo = (chainId) => {
        switch (chainId) {
            case 11155111n:
                return {
                    name: 'Sepolia',
                    color: 'text-purple-600 bg-purple-100'
                };
            case 1n:
                return {
                    name: 'Ethereum',
                    color: 'text-blue-600 bg-blue-100'
                };
            default:
                return {
                    name: 'Unknown Network',
                    color: 'text-gray-600 bg-gray-100'
                };
        }
    };

    const networkInfo = chainId ? getNetworkInfo(chainId) : {
        name: 'Not Connected',
        color: 'text-red-600 bg-red-100'
    };

    return (
        <div className={`px-4 py-1.5 rounded-full font-medium text-sm ${networkInfo.color}`}>
            {networkInfo.name}
        </div>
    );
}

export default NetworkStatus;
