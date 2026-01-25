/**
 * Artist Portal Dashboard Module
 */

const Dashboard = {
    data: null,

    /**
     * Initialize dashboard
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
        });

        await this.loadDashboard();
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
        // Set active nav item
        const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
        document.querySelectorAll('.nav-item').forEach(item => {
            const page = item.getAttribute('data-page');
            if (page === currentPage) {
                item.classList.add('active');
            }
        });

        // Mobile menu toggle
        const menuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.querySelector('.sidebar');
        if (menuBtn && sidebar) {
            menuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }

        // Logout handler
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                ArtistAuth.logout();
            });
        }
    },

    /**
     * Load dashboard data
     */
    async loadDashboard() {
        try {
            const response = await ArtistAuth.apiRequest('/dashboard');
            this.data = await response.json();

            this.renderStats();
            this.renderCampaigns();
            this.renderPlacements();
            this.renderSocialPosts();
            this.renderActivity();
            this.updateSutraBalance();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    },

    /**
     * Render stats grid
     */
    renderStats() {
        const { stats } = this.data;

        this.setElementText('stat-campaigns', stats.campaigns);
        this.setElementText('stat-placements', stats.placements);
        this.setElementText('stat-reach', this.formatNumber(stats.reach));
        this.setElementText('stat-sutra', stats.sutra_earned);
    },

    /**
     * Render recent campaigns
     */
    renderCampaigns() {
        const container = document.getElementById('recent-campaigns');
        if (!container) return;

        const { recent_campaigns } = this.data;

        if (!recent_campaigns || recent_campaigns.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-music"></i>
                    <h3>No campaigns yet</h3>
                    <p>Submit your first track to get started</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent_campaigns.map(campaign => `
            <div class="campaign-card" onclick="window.location.href='campaign.html?id=${campaign.id}'">
                <div class="campaign-artwork-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-music" style="font-size: 48px; color: white; opacity: 0.5;"></i>
                </div>
                <div class="campaign-info">
                    <div class="campaign-title">${this.escapeHtml(campaign.track_title)}</div>
                    <div class="campaign-artist">${campaign.tier} tier</div>
                    <div class="campaign-meta">
                        <span class="badge badge-${campaign.status}">${campaign.status}</span>
                        <span class="campaign-placements">${campaign.placements_count} placement${campaign.placements_count !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Render recent placements
     */
    renderPlacements() {
        const container = document.getElementById('recent-placements');
        if (!container) return;

        const { recent_placements } = this.data;

        if (!recent_placements || recent_placements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-list"></i>
                    <h3>No placements yet</h3>
                    <p>Your track placements will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = recent_placements.map(placement => `
            <div class="placement-item">
                <div class="placement-playlist-art" style="background: var(--spotify-green); display: flex; align-items: center; justify-content: center;">
                    <i class="fab fa-spotify" style="color: white;"></i>
                </div>
                <div class="placement-info">
                    <div class="placement-playlist-name">${this.escapeHtml(placement.playlist_name)}</div>
                    <div class="placement-track">${this.escapeHtml(placement.track_title)}</div>
                </div>
                <div class="placement-meta">
                    <div class="placement-followers">${this.formatNumber(placement.playlist_followers)} followers</div>
                    <div class="placement-date">${this.formatDate(placement.added_at)}</div>
                </div>
                <div class="placement-actions">
                    ${placement.playlist_url ? `
                        <a href="${placement.playlist_url}" target="_blank" class="btn btn-sm btn-spotify">
                            <i class="fab fa-spotify"></i> Open
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Render social posts
     */
    renderSocialPosts() {
        const container = document.getElementById('social-posts');
        if (!container) return;

        const { social_posts } = this.data;

        if (!social_posts || social_posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-share-alt"></i>
                    <h3>No social posts yet</h3>
                    <p>Social posts will be generated when you get placements</p>
                </div>
            `;
            return;
        }

        const platformIcons = {
            twitter: 'fab fa-twitter',
            instagram: 'fab fa-instagram',
            facebook: 'fab fa-facebook',
            tiktok: 'fab fa-tiktok'
        };

        container.innerHTML = social_posts.map((post, index) => `
            <div class="social-post-card">
                <div class="social-post-header">
                    <div class="social-post-platform ${post.platform}">
                        <i class="${platformIcons[post.platform] || 'fas fa-share'}"></i>
                        ${post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                    </div>
                    <button class="copy-btn" data-index="${index}" onclick="Dashboard.copyPost(${index})">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="social-post-content">${this.escapeHtml(post.content)}</div>
            </div>
        `).join('');
    },

    /**
     * Copy social post to clipboard
     */
    async copyPost(index) {
        const post = this.data.social_posts[index];
        if (!post) return;

        try {
            await navigator.clipboard.writeText(post.content);

            const btn = document.querySelector(`[data-index="${index}"]`);
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                btn.classList.add('copied');

                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    btn.classList.remove('copied');
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    },

    /**
     * Render activity feed
     */
    renderActivity() {
        const container = document.getElementById('activity-feed');
        if (!container) return;

        const { activity } = this.data;

        if (!activity || activity.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <h3>No recent activity</h3>
                </div>
            `;
            return;
        }

        container.innerHTML = activity.map(item => `
            <div class="activity-item">
                <div class="activity-icon ${item.type}">
                    <i class="fas fa-${item.type === 'placement' ? 'music' : 'coins'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${this.escapeHtml(item.description)} - ${this.escapeHtml(item.track_title)}</div>
                    <div class="activity-time">${this.formatDate(item.timestamp)}</div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Update SUTRA balance in sidebar
     */
    updateSutraBalance() {
        const { stats } = this.data;
        const balanceEl = document.getElementById('sutra-balance');
        if (balanceEl) {
            balanceEl.textContent = stats.sutra_earned || 0;
        }
    },

    /**
     * Helper: Format number with commas
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString();
    },

    /**
     * Helper: Format date
     */
    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;

        return date.toLocaleDateString();
    },

    /**
     * Helper: Escape HTML
     */
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Helper: Set element text
     */
    setElementText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    },

    /**
     * Show error message
     */
    showError(message) {
        // Could implement a toast notification here
        console.error(message);
    }
};

// Make Dashboard available globally
window.Dashboard = Dashboard;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
