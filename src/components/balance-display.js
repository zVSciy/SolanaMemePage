import React, { useEffect, useState } from 'react';
import { getBalance } from '../js/wallet';

const BalanceDisplay = ({ walletAddress }) => {
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            setLoading(true);
            try {
                const balance = await getBalance(walletAddress);
                setBalance(balance);
            } catch (error) {
                console.error("Error fetching balance:", error);
            } finally {
                setLoading(false);
            }
        };

        if (walletAddress) {
            fetchBalance();
        }
    }, [walletAddress]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>Wallet Balance</h2>
            <p>{balance} SOL</p>
        </div>
    );
};

export default BalanceDisplay;