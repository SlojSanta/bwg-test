import './App.css';
import Header from "./components/Header";
import Swap from "./components/Swap";
import { Routes, Route } from "react-router-dom";
import { useConnect, useAccount, useNetwork, useSwitchNetwork } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { useState } from 'react';

function App() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect({
      connector: new MetaMaskConnector(),
    });
    const { chain } = useNetwork()
    const { chains, error, isLoading, pendingChainId, switchNetwork } =
      useSwitchNetwork()

    //const [network, setNetwork] = useState({id: '137', name: 'polygon', description: 'Polygon'})

    //console.log(chain);
    return (

    <div className="App">
      <Header connect={connect} isConnected={isConnected} address={address} chain={chain} switchNetwork={switchNetwork}/>
      <div className="mainWindow">
        <Routes>
          <Route path="/bwg-test" element={<Swap isConnected={isConnected} address={address} chain={chain} switchNetwork={switchNetwork}/>} />
        </Routes>
      </div>

    </div>
    )
}

export default App;
