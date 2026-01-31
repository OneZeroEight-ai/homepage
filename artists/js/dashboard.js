/**
 * Artist Portal Dashboard Module
 */

const Dashboard = {
    data: null,
    selectedPlaylists: [],
    playlistStatuses: {},

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
            this.checkUpgradeBanner();
            await this.loadPlaylistMatching();
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    },

    /**
     * Check if user has free tier campaigns and show upgrade banner
     */
    async checkUpgradeBanner() {
        const { recent_campaigns } = this.data;
        if (!recent_campaigns || recent_campaigns.length === 0) return;

        // Check if any campaign is free/basic tier
        const freeCampaign = recent_campaigns.find(c =>
            c.tier === 'free' || c.tier === 'basic'
        );

        if (!freeCampaign) return;

        // Show the upgrade banner
        const banner = document.getElementById('upgrade-banner');
        if (!banner) return;

        // Get genre stats for personalized copy
        try {
            const genre = freeCampaign.track_genre || 'indie';
            const statsResponse = await fetch(`${ArtistAuth.API_BASE.replace('/artist-portal', '')}/stats/genre/${encodeURIComponent(genre)}`);

            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                const playlistCountEl = document.getElementById('playlist-count');
                if (playlistCountEl) {
                    playlistCountEl.textContent = stats.playlist_count || stats.curator_count || '3,000+';
                }
            }

            banner.style.display = 'flex';

            // Track conversion event
            this.trackConversion('viewed_banner', 'dashboard', {
                campaign_id: freeCampaign.id,
                tier: freeCampaign.tier
            });
        } catch (error) {
            console.error('Failed to load genre stats:', error);
            // Still show banner with default count
            banner.style.display = 'flex';
        }
    },

    /**
     * Load playlist matching data
     */
    async loadPlaylistMatching() {
        const { recent_campaigns } = this.data;
        if (!recent_campaigns || recent_campaigns.length === 0) return;

        // Get the most recent active campaign
        const activeCampaign = recent_campaigns.find(c => c.status === 'active') || recent_campaigns[0];
        if (!activeCampaign) return;

        const section = document.getElementById('playlist-matching');
        if (!section) return;

        try {
            // Get playlist matches with status from the new endpoint
            const matchesResponse = await fetch(
                `${ArtistAuth.API_BASE.replace('/artist-portal', '')}/campaigns/${activeCampaign.id}/playlist-matches`
            );

            if (matchesResponse.ok) {
                const matchesData = await matchesResponse.json();

                // Update total matches count
                this.setElementText('total-matches', matchesData.total_count || 0);

                // Count statuses from the playlists
                let sent = 0, accepted = 0, rejected = 0;
                const playlists = matchesData.playlists || [];

                playlists.forEach(p => {
                    if (p.status === 'sent' || p.status === 'pending') sent++;
                    else if (p.status === 'accepted') accepted++;
                    else if (p.status === 'rejected') rejected++;
                });

                this.setElementText('sent-count', sent);
                this.setElementText('accepted-count', accepted);
                this.setElementText('rejected-count', rejected);

                // Build status map for compatibility
                this.playlistStatuses = {};
                playlists.forEach(p => {
                    if (p.status !== 'available') {
                        this.playlistStatuses[p.id] = p.status;
                    }
                });

                // Show playlist list for pro tier
                if (activeCampaign.tier === 'pro' || activeCampaign.tier === 'album') {
                    const listSection = document.getElementById('playlist-list-section');
                    if (listSection && playlists.length > 0) {
                        listSection.style.display = 'block';
                        this.renderPlaylistCards(playlists);
                    }
                } else {
                    // Show free tier note
                    const freeNote = document.getElementById('free-tier-note');
                    if (freeNote) freeNote.style.display = 'block';
                }
            }

            // Show the section
            section.style.display = 'block';

        } catch (error) {
            console.error('Failed to load playlist matching:', error);
            // Don't show section if we can't load data
        }
    },

    /**
     * Get status info for playlist status indicator
     */
    getStatusInfo(status) {
        const statusMap = {
            'available': { icon: '', label: 'Available', color: 'transparent', cssClass: '' },
            'sent': { icon: '🟡', label: 'Pitched', color: '#f59e0b', cssClass: 'sent' },
            'pending': { icon: '🟡', label: 'Pending', color: '#f59e0b', cssClass: 'sent' },
            'accepted': { icon: '🟢', label: 'Accepted', color: '#10b981', cssClass: 'accepted' },
            'rejected': { icon: '🔴', label: 'Rejected', color: '#ef4444', cssClass: 'rejected' }
        };
        return statusMap[status] || statusMap['available'];
    },

    /**
     * Render playlist cards
     */
    renderPlaylistCards(playlists) {
        const container = document.getElementById('playlist-cards');
        if (!container || !playlists) return;

        const defaultImage = 'https://via.placeholder.com/64x64/1a1a2e/8b5cf6?text=%E2%99%AA';

        container.innerHTML = playlists.map(playlist => {
            const status = playlist.status || this.playlistStatuses[playlist.id] || 'available';
            const statusInfo = this.getStatusInfo(status);
            const isDisabled = status !== 'available';
            const isSelected = this.selectedPlaylists.includes(playlist.id);
            const imageUrl = playlist.image_url || defaultImage;

            // Build status indicator HTML
            let statusIndicator = '';
            if (status !== 'available') {
                statusIndicator = `
                    <div class="playlist-status-indicator ${statusInfo.cssClass}">
                        <span class="status-dot-indicator"></span>
                        <span class="status-text">${statusInfo.label}</span>
                    </div>
                `;
            }

            return `
                <div class="playlist-card ${isDisabled ? 'has-status' : ''} ${isSelected ? 'selected' : ''} status-${status}"
                     data-playlist-id="${playlist.id}"
                     onclick="Dashboard.togglePlaylistSelection('${playlist.id}', ${isDisabled})">
                    <input type="checkbox"
                           ${isDisabled ? 'disabled' : ''}
                           ${isSelected ? 'checked' : ''}
                           onclick="event.stopPropagation()">
                    <img src="${imageUrl}" class="playlist-image" alt="" onerror="this.src='${defaultImage}'">
                    <div class="playlist-info">
                        <div class="playlist-name">${this.escapeHtml(playlist.name || 'Playlist')}</div>
                        <div class="playlist-meta">
                            <span class="playlist-followers">${this.formatNumber(playlist.followers || 0)} followers</span>
                            ${playlist.genre ? `<span class="playlist-genre">${this.escapeHtml(playlist.genre)}</span>` : ''}
                        </div>
                    </div>
                    ${statusIndicator}
                </div>
            `;
        }).join('');
    },

    /**
     * Toggle playlist selection
     */
    togglePlaylistSelection(playlistId, isDisabled) {
        if (isDisabled) return;

        const index = this.selectedPlaylists.indexOf(playlistId);
        if (index > -1) {
            this.selectedPlaylists.splice(index, 1);
        } else {
            this.selectedPlaylists.push(playlistId);
        }

        // Update UI
        const card = document.querySelector(`[data-playlist-id="${playlistId}"]`);
        if (card) {
            card.classList.toggle('selected');
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (checkbox) checkbox.checked = this.selectedPlaylists.includes(playlistId);
        }

        this.updateSelectedCount();
    },

    /**
     * Update selected playlist count
     */
    updateSelectedCount() {
        const countEl = document.getElementById('selected-playlist-count');
        if (countEl) {
            countEl.textContent = this.selectedPlaylists.length;
        }
    },

    /**
     * Start upgrade flow
     */
    startUpgrade(tier) {
        const { recent_campaigns } = this.data;
        const freeCampaign = recent_campaigns?.find(c =>
            c.tier === 'free' || c.tier === 'basic'
        );

        // Track conversion event
        this.trackConversion('clicked_cta', 'dashboard_banner', {
            tier,
            campaign_id: freeCampaign?.id
        });

        // Redirect to upgrade page or checkout
        if (freeCampaign) {
            window.location.href = `submit.html?upgrade_from=${freeCampaign.id}&tier=${tier}`;
        } else {
            window.location.href = `submit.html?tier=${tier}`;
        }
    },

    /**
     * Track conversion event
     */
    async trackConversion(eventType, source, metadata = {}) {
        try {
            await fetch(`${ArtistAuth.API_BASE.replace('/artist-portal', '')}/conversion-events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: eventType,
                    source: source,
                    metadata: metadata
                })
            });
        } catch (error) {
            // Silent fail - conversion tracking shouldn't break UI
            console.debug('Conversion tracking failed:', error);
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

// DashboardModule wrapper for HTML onclick handlers
window.DashboardModule = {
    startUpgrade: (tier) => Dashboard.startUpgrade(tier)
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Dashboard.init());
