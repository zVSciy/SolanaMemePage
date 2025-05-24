function connectWallet() {
    if (window.solana && window.solana.isPhantom) {
        window.solana.connect()
            .then((response) => {
                console.log('Connected to wallet:', response.publicKey.toString());
                // You can add additional logic here to handle the connected wallet
            })
            .catch((err) => {
                console.error('Failed to connect wallet:', err);
            });
    } else {
        console.error('Phantom wallet not found. Please install it to use this feature.');
    }
}

function getWalletAddress() {
    if (window.solana && window.solana.isPhantom) {
        window.solana.getAccounts()
            .then((accounts) => {
                if (accounts.length > 0) {
                    console.log('Wallet address:', accounts[0].toString());
                    return accounts[0].toString();
                } else {
                    console.log('No connected wallet found.');
                }
            })
            .catch((err) => {
                console.error('Failed to get wallet address:', err);
            });
    } else {
        console.error('Phantom wallet not found. Please install it to use this feature.');
    }
}

export { connectWallet, getWalletAddress };