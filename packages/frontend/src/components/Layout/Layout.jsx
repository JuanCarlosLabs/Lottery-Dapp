import { useWeb3 } from '../../context/Web3Context';
import WinnersHistory from './WinnersHistory';
import BuyOneTicket from './BuyOneTicket';
import { NotificationProvider } from './Notifications';
import NetworkStatus from '../Web3/NetworkStatus';
import ConnectWallet from '../Web3/ConnectWallet';

function Layout({ children }) {
    const { signer, account } = useWeb3();

    return (
        <NotificationProvider>
            <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
                <nav className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Lottery dApp
                                </h1>
                            </div>
                            <div className="flex items-center space-x-4">
                                <NetworkStatus />
                                <ConnectWallet />
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="relative">
                
                    
                    <main className="max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                
                                <BuyOneTicket signer={signer} />
                            </div>
                            <div className="space-y-6">
                                <WinnersHistory signer={signer} />
                            </div>
                        </div>
                        {children}
                    </main>

                    
                </div>
            </div>
        </NotificationProvider>
    );
}

export default Layout; 