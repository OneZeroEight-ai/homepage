/**
 * Artist Portal SUTRA Wallet Module
 */

const Sutra = {
    balance: null,
    transactions: [],

    /**
     * Initialize SUTRA wallet page
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
        });

        await Promise.all([
            this.loadBalance(),
            this.loadTransactions()
        ]);

        this.initSidebar();
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
        this.setElementText('balance-usd', `~$${this.balance.usd_value.toFixed(2)} USD`);
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
    }
};

window.Sutra = Sutra;

document.addEventListener('DOMContentLoaded', () => Sutra.init());
