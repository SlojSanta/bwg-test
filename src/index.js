import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from "react-router-dom";
import { configureChains, mainnet, WagmiConfig, createClient } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { setupStore } from './store/store';
import { Provider } from 'react-redux';

const store = setupStore()

const { provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()]
);

const client = createClient({
  autoConnect: true,
  provider,
  webSocketProvider,
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <React.StrictMode>
      <WagmiConfig client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </WagmiConfig>
    </React.StrictMode>
  </Provider>
);