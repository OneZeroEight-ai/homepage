// Wallet Connection Module for Artist/Curator Portals
// Supports MetaMask and other Web3 wallets with SUTRA token on Polygon

const WalletModule = {
    // SUTRA Token Contract on Polygon
    SUTRA_CONTRACT: {
        address: '0x5f76b6b561690bB425F0e131A1AC5E8d0c92C3bB',
        decimals: 18
    },

    // Polygon Network Config
    POLYGON_CHAIN_ID: '0x89',

    // Minimal ABI for ERC20 balance check
    SUTRA_ABI: [
        {
            "constant": true,
            "inputs": [{ "name": "_owner", "type": "address" }],
            "name": "balanceOf",
            "outputs": [{ "name": "balance", "type": "uint256" }],
            "type": "function"
        }
    ],

    // State
    state: {
        connected: false,
        address: null,
        sutraBalance: 0,
        provider: null,
        signer: null
    },

    // Initialize wallet module
    init: function() {
        // Check for saved connection
        if (localStorage.getItem('walletConnected') === 'true' && window.ethereum) {
            this.reconnect();
        }

        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.state.address = accounts[0];
                    this.updateBalance();
                    this.updateUI();
                }
            });

            window.ethereum.on('chainChanged', () => {
                window.location.reload();
            });
        }

        this.updateUI();
    },

    // Attempt to reconnect saved wallet
    reconnect: async function() {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connect(true);
            }
        } catch (e) {
            console.log('Reconnect failed:', e);
        }
    },

    // Connect wallet
    connect: async function(silent = false) {
        if (!window.ethereum) {
            if (!silent) {
                alert('Please install MetaMask or another Web3 wallet to connect.');
            }
            return false;
        }

        try {
            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            // Check if on Polygon
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId !== this.POLYGON_CHAIN_ID) {
                await this.switchToPolygon();
            }

            // Initialize ethers if available
            if (typeof ethers !== 'undefined') {
                this.state.provider = new ethers.providers.Web3Provider(window.ethereum);
                this.state.signer = this.state.provider.getSigner();
            }

            this.state.address = accounts[0];
            this.state.connected = true;

            // Get SUTRA balance
            await this.updateBalance();

            // Update UI
            this.updateUI();

            // Save connection preference
            localStorage.setItem('walletConnected', 'true');

            if (!silent) {
                this.showToast('Wallet connected!', 'success');
            }

            return true;

        } catch (error) {
            console.error('Wallet connection error:', error);
            if (!silent) {
                if (error.code === 4001) {
                    this.showToast('Connection rejected by user', 'error');
                } else {
                    this.showToast('Failed to connect wallet', 'error');
                }
            }
            return false;
        }
    },

    // Switch to Polygon network
    switchToPolygon: async function() {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.POLYGON_CHAIN_ID }]
            });
        } catch (switchError) {
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: this.POLYGON_CHAIN_ID,
                        chainName: 'Polygon Mainnet',
                        nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
                        rpcUrls: ['https://polygon-rpc.com/'],
                        blockExplorerUrls: ['https://polygonscan.com/']
                    }]
                });
            } else {
                throw switchError;
            }
        }
    },

    // Update SUTRA balance
    updateBalance: async function() {
        if (!this.state.connected || !this.state.address) return;

        try {
            if (typeof ethers !== 'undefined' && this.state.provider) {
                const contract = new ethers.Contract(
                    this.SUTRA_CONTRACT.address,
                    this.SUTRA_ABI,
                    this.state.provider
                );

                const balance = await contract.balanceOf(this.state.address);
                this.state.sutraBalance = parseFloat(ethers.utils.formatUnits(balance, 18));
            }
        } catch (error) {
            console.error('Error getting SUTRA balance:', error);
            this.state.sutraBalance = 0;
        }
    },

    // Disconnect wallet
    disconnect: function() {
        this.state = {
            connected: false,
            address: null,
            sutraBalance: 0,
            provider: null,
            signer: null
        };

        localStorage.removeItem('walletConnected');
        this.updateUI();
        this.showToast('Wallet disconnected', 'success');
    },

    // Toggle connection
    toggle: function() {
        if (this.state.connected) {
            this.disconnect();
        } else {
            this.connect();
        }
    },

    // Update UI elements
    updateUI: function() {
        const walletBtn = document.getElementById('walletBtn');
        const walletText = document.getElementById('walletText');
        const walletBalance = document.getElementById('walletBalance');

        if (walletBtn) {
            if (this.state.connected) {
                walletBtn.classList.add('connected');
                if (walletText) {
                    walletText.textContent = this.shortenAddress(this.state.address);
                }
                if (walletBalance) {
                    walletBalance.textContent = this.formatBalance(this.state.sutraBalance) + ' SUTRA';
                    walletBalance.style.display = 'block';
                }
            } else {
                walletBtn.classList.remove('connected');
                if (walletText) {
                    walletText.textContent = 'Connect Wallet';
                }
                if (walletBalance) {
                    walletBalance.style.display = 'none';
                }
            }
        }

        // Note: Do NOT update the main sutra-balance element here
        // That shows the database/platform balance, not the on-chain wallet balance
        // The walletBalance element shows the on-chain balance for withdrawals
    },

    // Helper: Shorten address
    shortenAddress: function(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    },

    // Helper: Format balance
    formatBalance: function(balance) {
        if (balance >= 1000000) {
            return (balance / 1000000).toFixed(2) + 'M';
        } else if (balance >= 1000) {
            return (balance / 1000).toFixed(2) + 'K';
        } else {
            return balance.toFixed(2);
        }
    },

    // Show toast notification
    showToast: function(message, type) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'wallet-toast ' + type;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #10b981; color: white;' : 'background: #ef4444; color: white;'}
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get current wallet address
    getAddress: function() {
        return this.state.address;
    },

    // Get SUTRA balance
    getBalance: function() {
        return this.state.sutraBalance;
    },

    // Check if connected
    isConnected: function() {
        return this.state.connected;
    }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    WalletModule.init();
});

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
