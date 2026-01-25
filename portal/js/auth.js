/**
 * Artist Portal Authentication Module
 */

const ArtistAuth = {
    TOKEN_KEY: 'artist_token',
    ARTIST_KEY: 'artist_data',
    API_BASE: window.location.hostname === 'localhost'
        ? 'http://localhost:8000/api/artist-portal'
        : 'https://onezeroeight-backend-production.up.railway.app/api/artist-portal',

    /**
     * Get stored session token
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    /**
     * Set session token
     */
    setToken(token) {
        localStorage.setItem(this.TOKEN_KEY, token);
    },

    /**
     * Get stored artist data
     */
    getArtist() {
        const data = localStorage.getItem(this.ARTIST_KEY);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Set artist data
     */
    setArtist(artist) {
        localStorage.setItem(this.ARTIST_KEY, JSON.stringify(artist));
    },

    /**
     * Clear all auth data
     */
    clearAuth() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.ARTIST_KEY);
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Get authorization headers
     */
    getHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        };
    },

    /**
     * Make authenticated API request
     */
    async apiRequest(endpoint, options = {}) {
        const url = `${this.API_BASE}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...(options.headers || {})
            }
        });

        if (response.status === 401) {
            this.clearAuth();
            window.location.href = '/portal/';
            throw new Error('Session expired');
        }

        return response;
    },

    /**
     * Request magic link email
     */
    async requestMagicLink(email) {
        const response = await fetch(`${this.API_BASE}/magic-link`, {
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

    /**
     * Verify magic link token
     */
    async verifyToken(token) {
        const response = await fetch(`${this.API_BASE}/verify?token=${encodeURIComponent(token)}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || 'Invalid or expired link');
        }

        // Store auth data
        this.setToken(data.token);
        this.setArtist(data.artist);

        return data;
    },

    /**
     * Get current artist profile
     */
    async getCurrentArtist() {
        const response = await this.apiRequest('/me');
        const data = await response.json();

        if (response.ok) {
            this.setArtist(data.artist);
        }

        return data;
    },

    /**
     * Logout
     */
    async logout() {
        try {
            await this.apiRequest('/logout', { method: 'POST' });
        } catch (e) {
            // Ignore errors
        }

        this.clearAuth();
        window.location.href = '/portal/';
    },

    /**
     * Require authentication - redirects to login if not authenticated
     */
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/portal/';
            return false;
        }
        return true;
    },

    /**
     * Initialize page with auth check
     */
    async initPage(callback) {
        if (!this.requireAuth()) return;

        try {
            // Verify session is still valid
            const data = await this.getCurrentArtist();
            if (callback) callback(data.artist);
        } catch (error) {
            console.error('Auth error:', error);
            this.clearAuth();
            window.location.href = '/portal/';
        }
    }
};

// Export for use in other modules
window.ArtistAuth = ArtistAuth;
