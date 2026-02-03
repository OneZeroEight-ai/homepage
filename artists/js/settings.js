/**
 * Artist Portal Settings Module
 */

const SettingsModule = {
    originalData: null,
    hasChanges: false,

    /**
     * Initialize the settings page
     */
    async init() {
        // Check auth
        if (!ArtistAuth.requireAuth()) return;

        // Load profile data
        await this.loadProfile();

        // Set up event listeners
        this.setupEventListeners();

        // Set up sidebar
        this.setupSidebar();
    },

    /**
     * Load profile data from API
     */
    async loadProfile() {
        try {
            const response = await ArtistAuth.apiRequest('/profile');
            const data = await response.json();

            if (response.ok) {
                this.originalData = data.profile;
                this.populateForm(data.profile, data.stats);
            } else {
                this.showToast('Failed to load profile', 'error');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showToast('Failed to load profile', 'error');
        }
    },

    /**
     * Populate form with profile data
     */
    populateForm(profile, stats) {
        // Profile fields
        document.getElementById('artist-name').value = profile.artist_name || '';
        document.getElementById('email').value = profile.email || '';
        document.getElementById('spotify-url').value = profile.spotify_url || '';
        document.getElementById('genre').value = profile.genre || '';

        // Member since
        if (stats && stats.member_since) {
            document.getElementById('member-date').textContent = stats.member_since;
        }

        // Spotify status
        if (profile.spotify_url) {
            document.getElementById('spotify-status').className = 'account-status connected';
            document.getElementById('spotify-status').innerHTML = '<i class="fas fa-check-circle"></i><span>Connected</span>';
            document.getElementById('spotify-status-text').textContent = profile.spotify_url.replace('https://open.spotify.com/artist/', '').substring(0, 22) + '...';
        }

        // Wallet status
        if (profile.wallet_address) {
            const shortAddress = `${profile.wallet_address.substring(0, 6)}...${profile.wallet_address.substring(38)}`;
            document.getElementById('wallet-address-display').textContent = shortAddress;
            document.getElementById('wallet-status-container').innerHTML = `
                <div class="account-status connected">
                    <i class="fas fa-check-circle"></i>
                    <span>Connected</span>
                </div>
            `;
        }

        // Notification preferences
        document.getElementById('notify-placements').checked = profile.email_placements !== false;
        document.getElementById('notify-campaigns').checked = profile.email_campaigns !== false;
        document.getElementById('notify-marketing').checked = profile.email_marketing === true;

        // SUTRA balance
        document.getElementById('sutra-balance').textContent = (profile.sutra_balance || 0).toLocaleString();

        // User info in sidebar
        const artistName = profile.artist_name || profile.name || 'Artist';
        document.getElementById('user-name').textContent = artistName;
        document.getElementById('user-avatar').textContent = artistName.charAt(0).toUpperCase();
    },

    /**
     * Set up event listeners for form changes
     */
    setupEventListeners() {
        // Profile form inputs
        const inputs = ['artist-name', 'spotify-url', 'genre'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.markChanged());
                element.addEventListener('change', () => this.markChanged());
            }
        });

        // Notification toggles
        const toggles = ['notify-placements', 'notify-campaigns', 'notify-marketing'];
        toggles.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.markChanged());
            }
        });

        // Logout button
        document.getElementById('logout-btn').addEventListener('click', () => {
            ArtistAuth.logout();
        });

        // Mobile menu
        const mobileBtn = document.getElementById('mobile-menu-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
            });
        }
    },

    /**
     * Set up sidebar navigation
     */
    setupSidebar() {
        // Mark current page as active
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === 'settings') {
                item.classList.add('active');
            }
        });
    },

    /**
     * Mark form as having changes
     */
    markChanged() {
        this.hasChanges = true;
        document.getElementById('save-bar').classList.add('visible');
    },

    /**
     * Reset form to original values
     */
    resetChanges() {
        if (this.originalData) {
            this.populateForm(this.originalData, null);
        }
        this.hasChanges = false;
        document.getElementById('save-bar').classList.remove('visible');
    },

    /**
     * Save all changes
     */
    async saveChanges() {
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

        try {
            // Save profile
            const profileData = {
                artist_name: document.getElementById('artist-name').value,
                spotify_url: document.getElementById('spotify-url').value,
                genre: document.getElementById('genre').value
            };

            const profileResponse = await ArtistAuth.apiRequest('/profile', {
                method: 'PATCH',
                body: JSON.stringify(profileData)
            });

            if (!profileResponse.ok) {
                const error = await profileResponse.json();
                throw new Error(error.detail || 'Failed to save profile');
            }

            // Save notification preferences
            const notificationData = {
                email_placements: document.getElementById('notify-placements').checked,
                email_campaigns: document.getElementById('notify-campaigns').checked,
                email_marketing: document.getElementById('notify-marketing').checked
            };

            const notificationResponse = await ArtistAuth.apiRequest('/notifications', {
                method: 'PATCH',
                body: JSON.stringify(notificationData)
            });

            if (!notificationResponse.ok) {
                console.warn('Failed to save notification preferences');
            }

            // Update original data
            this.originalData = {
                ...this.originalData,
                ...profileData,
                ...notificationData
            };

            this.hasChanges = false;
            document.getElementById('save-bar').classList.remove('visible');
            this.showToast('Settings saved successfully', 'success');

        } catch (error) {
            console.error('Error saving settings:', error);
            this.showToast(error.message || 'Failed to save settings', 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.getElementById('toast-message');

        toast.className = `toast ${type}`;
        toastMessage.textContent = message;

        // Update icon
        const icon = toast.querySelector('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';

        toast.classList.add('visible');

        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
};

/**
 * Connect wallet function
 */
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        SettingsModule.showToast('Please install MetaMask to connect a wallet', 'error');
        return;
    }

    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];

        // Save to backend
        const response = await ArtistAuth.apiRequest('/wallet/connect', {
            method: 'POST',
            body: JSON.stringify({ wallet_address: address })
        });

        if (response.ok) {
            const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
            document.getElementById('wallet-address-display').textContent = shortAddress;
            document.getElementById('wallet-status-container').innerHTML = `
                <div class="account-status connected">
                    <i class="fas fa-check-circle"></i>
                    <span>Connected</span>
                </div>
            `;
            SettingsModule.showToast('Wallet connected successfully', 'success');
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to connect wallet');
        }
    } catch (error) {
        console.error('Wallet connection error:', error);
        SettingsModule.showToast(error.message || 'Failed to connect wallet', 'error');
    }
}

/**
 * Confirm account deletion
 */
function confirmDeleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        return;
    }

    if (!confirm('This will permanently delete all your campaigns, placements, and SUTRA balance. Type "DELETE" to confirm.')) {
        return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
        SettingsModule.showToast('Account deletion cancelled', 'error');
        return;
    }

    deleteAccount();
}

/**
 * Delete account
 */
async function deleteAccount() {
    try {
        const response = await ArtistAuth.apiRequest('/account', {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Your account has been deleted. You will be redirected to the home page.');
            ArtistAuth.clearAuth();
            window.location.href = '/';
        } else {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to delete account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        SettingsModule.showToast(error.message || 'Failed to delete account', 'error');
    }
}

/**
 * Reset changes wrapper
 */
function resetChanges() {
    SettingsModule.resetChanges();
}

/**
 * Save changes wrapper
 */
function saveChanges() {
    SettingsModule.saveChanges();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    SettingsModule.init();
});
