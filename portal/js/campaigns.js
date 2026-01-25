/**
 * Artist Portal Campaigns Module
 */

const Campaigns = {
    data: null,
    campaignDetail: null,

    /**
     * Initialize campaigns page
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
        });

        // Check if we're on campaign detail page
        const urlParams = new URLSearchParams(window.location.search);
        const campaignId = urlParams.get('id');

        if (campaignId) {
            await this.loadCampaignDetail(campaignId);
        } else {
            await this.loadCampaigns();
        }

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
            if (page === 'campaigns' || page === 'campaign') {
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
     * Load all campaigns
     */
    async loadCampaigns() {
        try {
            const response = await ArtistAuth.apiRequest('/campaigns');
            this.data = await response.json();
            this.renderCampaignsList();
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    },

    /**
     * Render campaigns list
     */
    renderCampaignsList() {
        const container = document.getElementById('campaigns-grid');
        if (!container) return;

        const { campaigns } = this.data;

        if (!campaigns || campaigns.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-music"></i>
                    <h3>No campaigns yet</h3>
                    <p>Submit your first track to get started</p>
                    <a href="/" class="btn btn-primary" style="margin-top: 15px;">Submit a Track</a>
                </div>
            `;
            return;
        }

        container.innerHTML = campaigns.map(campaign => `
            <div class="campaign-card" onclick="window.location.href='campaign.html?id=${campaign.id}'">
                <div class="campaign-artwork-placeholder" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); aspect-ratio: 1; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-music" style="font-size: 48px; color: white; opacity: 0.5;"></i>
                </div>
                <div class="campaign-info">
                    <div class="campaign-title">${this.escapeHtml(campaign.track_title)}</div>
                    <div class="campaign-artist">${campaign.tier} tier</div>
                    <div class="campaign-meta">
                        <span class="badge badge-${campaign.status}">${campaign.status}</span>
                        <span class="campaign-placements">${campaign.placements_confirmed} placement${campaign.placements_confirmed !== 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Load campaign detail
     */
    async loadCampaignDetail(campaignId) {
        try {
            const response = await ArtistAuth.apiRequest(`/campaigns/${campaignId}`);
            this.campaignDetail = await response.json();
            this.renderCampaignDetail();
        } catch (error) {
            console.error('Failed to load campaign:', error);
            if (error.message.includes('404')) {
                window.location.href = 'campaigns.html';
            }
        }
    },

    /**
     * Render campaign detail page
     */
    renderCampaignDetail() {
        const { campaign, stats, placements, timeline, social_posts } = this.campaignDetail;

        // Update page title
        document.title = `${campaign.track_title} - Artist Portal`;

        // Update header
        const titleEl = document.getElementById('campaign-title');
        if (titleEl) titleEl.textContent = campaign.track_title;

        const statusEl = document.getElementById('campaign-status');
        if (statusEl) {
            statusEl.className = `badge badge-${campaign.status}`;
            statusEl.textContent = campaign.status;
        }

        // Update stats
        this.setElementText('stat-placements', stats.placements);
        this.setElementText('stat-reach', this.formatNumber(stats.reach));
        this.setElementText('stat-emails', stats.emails_sent);
        this.setElementText('stat-responses', stats.responses);

        // Render placements table
        this.renderPlacementsTable(placements);

        // Render timeline
        this.renderTimeline(timeline);

        // Render social posts
        this.renderSocialPosts(social_posts);

        // Spotify link
        const spotifyLink = document.getElementById('spotify-link');
        if (spotifyLink && campaign.track_spotify_url) {
            spotifyLink.href = campaign.track_spotify_url;
            spotifyLink.style.display = 'inline-flex';
        }
    },

    /**
     * Render placements table
     */
    renderPlacementsTable(placements) {
        const container = document.getElementById('placements-table');
        if (!container) return;

        if (!placements || placements.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 40px;">
                        <div class="empty-state">
                            <i class="fas fa-list"></i>
                            <h3>No placements yet</h3>
                            <p>Placements will appear here when curators add your track</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }

        container.innerHTML = placements.map(p => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 40px; height: 40px; background: var(--spotify-green); border-radius: 6px; display: flex; align-items: center; justify-content: center;">
                            <i class="fab fa-spotify" style="color: white;"></i>
                        </div>
                        <div>
                            <div style="font-weight: 500;">${this.escapeHtml(p.playlist_name)}</div>
                            <div style="font-size: 12px; color: var(--text-muted);">${this.escapeHtml(p.curator_name)}</div>
                        </div>
                    </div>
                </td>
                <td>${this.formatNumber(p.playlist_followers)}</td>
                <td>${this.formatDate(p.added_at)}</td>
                <td><span class="badge badge-${p.verified ? 'placed' : 'pending'}">${p.verified ? 'Verified' : 'Pending'}</span></td>
                <td>
                    ${p.playlist_url ? `
                        <a href="${p.playlist_url}" target="_blank" class="btn btn-sm btn-spotify">
                            <i class="fab fa-spotify"></i> Open
                        </a>
                    ` : ''}
                </td>
            </tr>
        `).join('');
    },

    /**
     * Render timeline
     */
    renderTimeline(timeline) {
        const container = document.getElementById('campaign-timeline');
        if (!container) return;

        if (!timeline || timeline.length === 0) {
            container.innerHTML = '<p class="text-muted">No timeline events yet</p>';
            return;
        }

        container.innerHTML = timeline.map((item, index) => `
            <div class="timeline-item ${item.completed ? 'completed' : (index === timeline.length - 1 ? 'current' : '')}">
                <div class="timeline-dot"></div>
                <div class="timeline-event">${this.escapeHtml(item.event)}</div>
                <div class="timeline-description">${this.escapeHtml(item.description)}</div>
                ${item.timestamp ? `<div class="timeline-date">${this.formatDate(item.timestamp)}</div>` : ''}
            </div>
        `).join('');
    },

    /**
     * Render social posts
     */
    renderSocialPosts(social_posts) {
        const container = document.getElementById('social-posts');
        if (!container) return;

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
                    <button class="copy-btn" data-index="${index}" onclick="Campaigns.copyPost(${index})">
                        <i class="fas fa-copy"></i> Copy
                    </button>
                </div>
                <div class="social-post-content">${this.escapeHtml(post.content)}</div>
            </div>
        `).join('');
    },

    /**
     * Copy social post
     */
    async copyPost(index) {
        const post = this.campaignDetail.social_posts[index];
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
     * Helper functions
     */
    formatNumber(num) {
        if (num === undefined || num === null) return '0';
        return num.toLocaleString();
    },

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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

window.Campaigns = Campaigns;

document.addEventListener('DOMContentLoaded', () => Campaigns.init());
