import { Web3Provider } from './context/Web3Context';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <Web3Provider>
      <Layout>
      </Layout>
    </Web3Provider>
  );
}

export default App;
