import React, { useState, useEffect } from 'react';
import { Connection, WalletAdapterNetwork } from '@solana/web3.js';
import { WalletProvider, ConnectionProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';

const network = WalletAdapterNetwork.Devnet;
const endpoint = 'https://api.devnet.solana.com';

const WalletConnect = () => {
    const [wallet, setWallet] = useState(null);
    const [connected, setConnected] = useState(false);

    const connectWallet = async () => {
        if (wallet) {
            await wallet.connect();
            setConnected(true);
        }
    };

    const disconnectWallet = async () => {
        if (wallet) {
            await wallet.disconnect();
            setConnected(false);
        }
    };

    useEffect(() => {
        const phantom = new PhantomWalletAdapter();
        setWallet(phantom);
    }, []);

    return (
        <div>
            {connected ? (
                <button onClick={disconnectWallet}>Disconnect Wallet</button>
            ) : (
                <button onClick={connectWallet}>Connect Wallet</button>
            )}
        </div>
    );
};

export default WalletConnect;