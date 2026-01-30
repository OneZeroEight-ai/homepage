/**
 * Artist Portal SUTRA Wallet Module
 */

const Sutra = {
    balance: null,
    transactions: [],
    withdrawals: [],

    /**
     * Initialize SUTRA wallet page
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
            this.loadReferralCode(artist);
        });

        await Promise.all([
            this.loadBalance(),
            this.loadTransactions(),
            this.loadWithdrawals()
        ]);

        this.initSidebar();
        this.updateWithdrawUI();
    },

    /**
     * Update user info in sidebar
     */
    updateUserInfo(artist) {
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');

        if (userName) {
            userName.textContent = artist.artist_name || artist.name || 'Artist';
        }

        if (userAvatar) {
            const name = artist.artist_name || artist.name || 'A';
            userAvatar.textContent = name.charAt(0).toUpperCase();
        }
    },

    /**
     * Initialize sidebar
     */
    initSidebar() {
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === 'sutra') {
                item.classList.add('active');
            }
        });

        const menuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ArtistAuth.logout();
            });
        }
    },

    /**
     * Load SUTRA balance
     */
    async loadBalance() {
        try {
            const response = await ArtistAuth.apiRequest('/sutra/balance');
            this.balance = await response.json();
            this.renderBalance();
        } catch (error) {
            console.error('Failed to load balance:', error);
        }
    },

    /**
     * Load transactions
     */
    async loadTransactions() {
        try {
            const response = await ArtistAuth.apiRequest('/sutra/transactions');
            const data = await response.json();
            this.transactions = data.transactions;
            this.renderTransactions();
        } catch (error) {
            console.error('Failed to load transactions:', error);
        }
    },

    /**
     * Render balance card
     */
    renderBalance() {
        if (!this.balance) return;

        this.setElementText('balance-value', this.formatNumber(this.balance.balance));
        this.setElementText('stat-earned', this.formatNumber(this.balance.total_earned));
        this.setElementText('stat-spent', this.formatNumber(this.balance.total_spent));
        this.setElementText('stat-pending', this.formatNumber(this.balance.pending));

        // Wallet connection status
        const walletStatus = document.getElementById('wallet-status');
        if (walletStatus) {
            if (this.balance.wallet_connected) {
                walletStatus.innerHTML = `
                    <i class="fas fa-check-circle" style="color: var(--status-placed);"></i>
                    Connected: ${this.truncateAddress(this.balance.wallet_address)}
                `;
            } else {
                walletStatus.innerHTML = `
                    <i class="fas fa-exclamation-circle" style="color: var(--status-pending);"></i>
                    No wallet connected
                `;
            }
        }

        // Update sidebar balance
        const sidebarBalance = document.getElementById('sutra-balance');
        if (sidebarBalance) {
            sidebarBalance.textContent = this.balance.balance || 0;
        }
    },

    /**
     * Render transactions list
     */
    renderTransactions() {
        const container = document.getElementById('transactions-list');
        if (!container) return;

        if (!this.transactions || this.transactions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-coins"></i>
                    <h3>No transactions yet</h3>
                    <p>Your SUTRA transactions will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.transactions.map(tx => {
            const isPositive = ['earned', 'reward', 'bonus'].includes(tx.type);
            const iconClass = this.getTransactionIcon(tx.type);

            return `
                <div class="transaction-item">
                    <div class="transaction-icon ${tx.type}">
                        <i class="fas fa-${iconClass}"></i>
                    </div>
                    <div class="transaction-info">
                        <div class="transaction-description">${this.escapeHtml(tx.description || this.getTransactionLabel(tx.type))}</div>
                        <div class="transaction-date">${this.formatDate(tx.created_at)}</div>
                    </div>
                    <div class="transaction-amount ${isPositive ? 'positive' : 'negative'}">
                        ${isPositive ? '+' : '-'}${Math.abs(tx.amount)} SUTRA
                    </div>
                </div>
            `;
        }).join('');
    },

    /**
     * Get transaction icon
     */
    getTransactionIcon(type) {
        const icons = {
            earned: 'arrow-down',
            reward: 'gift',
            bonus: 'star',
            spent: 'arrow-up',
            withdrawn: 'external-link-alt',
            pending: 'clock'
        };
        return icons[type] || 'coins';
    },

    /**
     * Get transaction label
     */
    getTransactionLabel(type) {
        const labels = {
            earned: 'Earned',
            reward: 'Reward',
            bonus: 'Bonus',
            spent: 'Spent',
            withdrawn: 'Withdrawn',
            pending: 'Pending'
        };
        return labels[type] || type;
    },

    /**
     * Truncate wallet address
     */
    truncateAddress(address) {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    /**
     * Export transactions to CSV
     */
    exportCSV() {
        if (!this.transactions || this.transactions.length === 0) {
            alert('No transactions to export');
            return;
        }

        const headers = ['Date', 'Type', 'Description', 'Amount'];
        const rows = this.transactions.map(tx => [
            new Date(tx.created_at).toISOString(),
            tx.type,
            tx.description || '',
            tx.amount
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'sutra-transactions.csv';
        a.click();

        URL.revokeObjectURL(url);
    },

    /**
     * Helper functions
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString();
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    /**
     * Load referral code from artist data
     */
    loadReferralCode(artist) {
        const codeEl = document.getElementById('referral-code');
        if (codeEl && artist) {
            // Generate referral code from artist ID if not already present
            const code = artist.referral_code || this.generateReferralCode(artist.id);
            codeEl.textContent = code;
        }
    },

    /**
     * Generate a referral code from artist ID
     */
    generateReferralCode(artistId) {
        if (!artistId) return 'SUTRA000';
        // Take first 8 chars of ID and make uppercase
        return 'SUTRA' + artistId.replace(/-/g, '').substring(0, 6).toUpperCase();
    },

    /**
     * Copy referral code to clipboard
     */
    copyReferralCode() {
        const codeEl = document.getElementById('referral-code');
        if (!codeEl) return;

        const code = codeEl.textContent;
        navigator.clipboard.writeText(code).then(() => {
            // Show copied feedback
            const originalText = codeEl.textContent;
            codeEl.textContent = 'Copied!';
            codeEl.style.color = '#10b981';
            setTimeout(() => {
                codeEl.textContent = originalText;
                codeEl.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    },

    /**
     * Load withdrawals history
     */
    async loadWithdrawals() {
        try {
            const response = await ArtistAuth.apiRequest('/withdrawals');
            const data = await response.json();
            this.withdrawals = data.withdrawals || [];
            this.renderWithdrawals();
        } catch (error) {
            console.error('Failed to load withdrawals:', error);
        }
    },

    /**
     * Update withdrawal UI based on wallet connection
     */
    updateWithdrawUI() {
        const walletStatus = document.getElementById('wallet-status');
        const connectedWallet = document.getElementById('connected-wallet');
        const withdrawForm = document.getElementById('withdraw-form');
        const connectPrompt = document.getElementById('connect-prompt');
        const walletAddressDisplay = document.getElementById('wallet-address-display');

        if (!this.balance) return;

        if (this.balance.wallet_connected && this.balance.wallet_address) {
            // Wallet is connected
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <i class="fas fa-check-circle" style="color: var(--status-placed);"></i>
                    <span>Wallet connected</span>
                `;
            }
            if (connectedWallet) {
                connectedWallet.style.display = 'block';
            }
            if (walletAddressDisplay) {
                walletAddressDisplay.textContent = this.balance.wallet_address;
            }
            if (withdrawForm) {
                withdrawForm.style.display = 'block';
            }
            if (connectPrompt) {
                connectPrompt.style.display = 'none';
            }
        } else {
            // Wallet not connected
            if (walletStatus) {
                walletStatus.innerHTML = `
                    <i class="fas fa-exclamation-circle" style="color: var(--status-pending);"></i>
                    <span>Connect wallet to withdraw</span>
                `;
            }
            if (connectedWallet) {
                connectedWallet.style.display = 'none';
            }
            if (withdrawForm) {
                withdrawForm.style.display = 'none';
            }
            if (connectPrompt) {
                connectPrompt.style.display = 'block';
            }
        }
    },

    /**
     * Perform withdrawal
     */
    async withdraw() {
        const amountInput = document.getElementById('withdraw-amount');
        const withdrawBtn = document.getElementById('withdraw-btn');

        if (!amountInput) return;

        const amount = parseFloat(amountInput.value);

        // Validation
        if (!amount || isNaN(amount)) {
            alert('Please enter a valid amount');
            return;
        }

        if (amount < 100) {
            alert('Minimum withdrawal is 100 SUTRA');
            return;
        }

        if (this.balance && amount > this.balance.balance) {
            alert('Insufficient balance');
            return;
        }

        // Disable button and show loading
        if (withdrawBtn) {
            withdrawBtn.disabled = true;
            withdrawBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        try {
            const response = await ArtistAuth.apiRequest('/withdraw', {
                method: 'POST',
                body: JSON.stringify({ amount: amount })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Success
                alert(`Withdrawal successful!\n\nAmount: ${amount} SUTRA\nTx: ${result.tx_hash || 'Processing...'}`);

                // Clear input
                amountInput.value = '';

                // Reload data
                await Promise.all([
                    this.loadBalance(),
                    this.loadWithdrawals()
                ]);
                this.updateWithdrawUI();
            } else {
                throw new Error(result.detail || result.error || 'Withdrawal failed');
            }
        } catch (error) {
            console.error('Withdrawal failed:', error);
            alert(`Withdrawal failed: ${error.message}`);
        } finally {
            // Re-enable button
            if (withdrawBtn) {
                withdrawBtn.disabled = false;
                withdrawBtn.innerHTML = '<i class="fas fa-arrow-up"></i> Withdraw SUTRA';
            }
        }
    },

    /**
     * Render withdrawals list
     */
    renderWithdrawals() {
        const container = document.getElementById('withdrawals-list');
        if (!container) return;

        if (!this.withdrawals || this.withdrawals.length === 0) {
            container.innerHTML = `
                <div style="color: var(--text-muted); font-size: 13px; text-align: center; padding: 20px;">
                    No withdrawals yet
                </div>
            `;
            return;
        }

        container.innerHTML = this.withdrawals.map(w => {
            const statusColor = {
                'completed': 'var(--status-placed)',
                'processing': 'var(--status-pending)',
                'pending': 'var(--status-pending)',
                'failed': 'var(--status-declined)'
            }[w.status] || 'var(--text-secondary)';

            const statusIcon = {
                'completed': 'check-circle',
                'processing': 'spinner fa-spin',
                'pending': 'clock',
                'failed': 'times-circle'
            }[w.status] || 'circle';

            return `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border-light); font-size: 13px;">
                    <div>
                        <div style="color: var(--text-primary); font-weight: 500;">${w.amount} SUTRA</div>
                        <div style="color: var(--text-muted); font-size: 11px;">${this.formatDate(w.requested_at)}</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="display: flex; align-items: center; gap: 5px; color: ${statusColor};">
                            <i class="fas fa-${statusIcon}"></i>
                            <span style="text-transform: capitalize;">${w.status}</span>
                        </div>
                        ${w.explorer_url ? `<a href="${w.explorer_url}" target="_blank" style="font-size: 11px; color: var(--primary);">View on Polygonscan</a>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
};

window.Sutra = Sutra;

document.addEventListener('DOMContentLoaded', () => Sutra.init());
