/**
 * Curator Portal Auth Context
 * Separate from artist/user auth - uses localStorage with 'curator_' prefix
 */

const API_BASE = 'https://onezeroeight-backend-production.up.railway.app/api/curator-portal';

const CuratorAuth = {
    // Storage keys (prefixed to avoid collision with artist auth)
    TOKEN_KEY: 'curator_token',
    CURATOR_KEY: 'curator_data',

    // Get stored token
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    // Get stored curator data
    getCurator() {
        const data = localStorage.getItem(this.CURATOR_KEY);
        return data ? JSON.parse(data) : null;
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Store auth data after login
    setAuth(token, curator) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.CURATOR_KEY, JSON.stringify(curator));
    },

    // Clear auth data on logout
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.CURATOR_KEY);
    },

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = '/curators/login.html';
            return false;
        }
        return true;
    },

    // Redirect to dashboard if already authenticated
    redirectIfLoggedIn() {
        if (this.isLoggedIn()) {
            window.location.href = '/curators/dashboard.html';
            return true;
        }
        return false;
    },

    // API call helper with auth header
    async apiCall(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.clearAuth();
            window.location.href = '/curators/login.html';
            throw new Error('Session expired');
        }

        return response;
    },

    // Login with email/password
    async login(email, password) {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Login failed');
        }

        this.setAuth(data.token, data.curator);
        return data;
    },

    // Register new curator
    async register(email, password, name) {
        const response = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Registration failed');
        }

        return data;
    },

    // Request magic link
    async requestMagicLink(email) {
        const response = await fetch(`${API_BASE}/magic-link`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Failed to send magic link');
        }

        return data;
    },

    // Verify magic link token
    async verifyMagicLink(token) {
        const response = await fetch(`${API_BASE}/verify-magic-link/${token}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Invalid or expired link');
        }

        this.setAuth(data.token, data.curator);
        return data;
    },

    // Logout
    async logout() {
        try {
            await this.apiCall('/logout', { method: 'POST' });
        } catch (e) {
            // Ignore errors, clear local state anyway
        }
        this.clearAuth();
        window.location.href = '/curators/login.html';
    },

    // Get dashboard data
    async getDashboard() {
        const response = await this.apiCall('/me');
        if (!response.ok) {
            throw new Error('Failed to load dashboard');
        }
        return response.json();
    },

    // Get submissions
    async getSubmissions(status = null) {
        const query = status ? `?status=${status}` : '';
        const response = await this.apiCall(`/submissions${query}`);
        if (!response.ok) {
            throw new Error('Failed to load submissions');
        }
        return response.json();
    },

    // Accept submission
    async acceptSubmission(submissionId, playlistId) {
        const response = await this.apiCall(`/submissions/${submissionId}/accept`, {
            method: 'POST',
            body: JSON.stringify({ playlist_id: playlistId })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to accept');
        }
        return response.json();
    },

    // Decline submission
    async declineSubmission(submissionId, reason, notes = null) {
        const response = await this.apiCall(`/submissions/${submissionId}/decline`, {
            method: 'POST',
            body: JSON.stringify({ reason, notes })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to decline');
        }
        return response.json();
    },

    // Get earnings
    async getEarnings() {
        const response = await this.apiCall('/earnings');
        if (!response.ok) {
            throw new Error('Failed to load earnings');
        }
        return response.json();
    },

    // Connect wallet
    async connectWallet(walletAddress) {
        const response = await this.apiCall('/wallet/connect', {
            method: 'POST',
            body: JSON.stringify({ wallet_address: walletAddress })
        });
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || 'Failed to connect wallet');
        }
        return response.json();
    },

    // Request withdrawal
    async requestWithdrawal(amount) {
        const response = await this.apiCall('/withdraw', {
            method: 'POST',
            body: JSON.stringify({ amount })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.detail || 'Withdrawal failed');
        }
        return data;
    },

    // Get withdrawals history
    async getWithdrawals() {
        const response = await this.apiCall('/withdrawals');
        if (!response.ok) {
            throw new Error('Failed to load withdrawals');
        }
        return response.json();
    }
};

// Export for use in pages
window.CuratorAuth = CuratorAuth;
