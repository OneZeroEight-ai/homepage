/**
 * Artist Portal Placements Module
 */

const Placements = {
    data: null,
    filters: {
        campaign_id: null,
        status: null
    },

    /**
     * Initialize placements page
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
        });

        await this.loadPlacements();
        this.initSidebar();
        this.initFilters();
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
            if (page === 'placements') {
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
     * Initialize filters
     */
    initFilters() {
        const statusFilter = document.getElementById('filter-status');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value || null;
                this.renderPlacements();
            });
        }

        const searchInput = document.getElementById('search-playlist');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterBySearch(e.target.value);
            });
        }
    },

    /**
     * Load placements
     */
    async loadPlacements() {
        try {
            let url = '/placements';
            const params = new URLSearchParams();

            if (this.filters.campaign_id) {
                params.append('campaign_id', this.filters.campaign_id);
            }

            if (params.toString()) {
                url += '?' + params.toString();
            }

            const response = await ArtistAuth.apiRequest(url);
            this.data = await response.json();

            this.renderStats();
            this.renderPlacements();
        } catch (error) {
            console.error('Failed to load placements:', error);
        }
    },

    /**
     * Render stats row
     */
    renderStats() {
        const { stats } = this.data;

        this.setElementText('stat-total', stats.total);
        this.setElementText('stat-active', stats.active);
        this.setElementText('stat-reach', this.formatNumber(stats.reach));
        this.setElementText('stat-sutra', stats.sutra_earned);
    },

    /**
     * Render placements grid
     */
    renderPlacements() {
        const container = document.getElementById('placements-grid');
        if (!container) return;

        let { placements } = this.data;

        // Apply status filter
        if (this.filters.status) {
            placements = placements.filter(p => p.status === this.filters.status);
        }

        if (!placements || placements.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-list"></i>
                    <h3>No placements found</h3>
                    <p>Your track placements will appear here</p>
                </div>
            `;
            return;
        }

        container.innerHTML = placements.map(p => `
            <div class="placement-card ${p.status === 'expired' ? 'expired' : ''}">
                <div class="placement-header">
                    <div style="width: 50px; height: 50px; background: var(--spotify-green); border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="fab fa-spotify" style="color: white; font-size: 24px;"></i>
                    </div>
                    <div class="placement-playlist-info">
                        <div class="placement-playlist-name">${this.escapeHtml(p.playlist_name)}</div>
                        <div style="font-size: 12px; color: var(--text-muted);">by ${this.escapeHtml(p.curator_name)}</div>
                    </div>
                    <span class="badge badge-${p.status}">${p.status}</span>
                </div>

                <div class="placement-track-info">
                    <i class="fas fa-music" style="margin-right: 5px;"></i>
                    ${this.escapeHtml(p.track_title)}
                </div>

                <div class="placement-stats">
                    <div class="placement-stat">
                        <span class="placement-stat-label">Followers</span>
                        <span class="placement-stat-value">${this.formatNumber(p.playlist_followers)}</span>
                    </div>
                    <div class="placement-stat">
                        <span class="placement-stat-label">Added</span>
                        <span class="placement-stat-value">${this.formatDate(p.added_at)}</span>
                    </div>
                </div>

                <div class="placement-footer">
                    <span class="badge badge-${p.verified ? 'placed' : 'pending'}">${p.verified ? 'Verified' : 'Pending'}</span>
                    <div style="display: flex; gap: 8px;">
                        ${p.playlist_url ? `
                            <a href="${p.playlist_url}" target="_blank" class="btn btn-sm btn-spotify">
                                <i class="fab fa-spotify"></i> Open
                            </a>
                        ` : ''}
                        <button class="btn btn-sm btn-outline" onclick="Placements.sharePlacement('${p.id}')">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Filter by search term
     */
    filterBySearch(term) {
        const cards = document.querySelectorAll('.placement-card');
        const searchTerm = term.toLowerCase();

        cards.forEach(card => {
            const playlistName = card.querySelector('.placement-playlist-name')?.textContent.toLowerCase() || '';
            const trackTitle = card.querySelector('.placement-track-info')?.textContent.toLowerCase() || '';

            if (playlistName.includes(searchTerm) || trackTitle.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    },

    /**
     * Share placement
     */
    async sharePlacement(placementId) {
        const placement = this.data.placements.find(p => p.id === placementId);
        if (!placement || !placement.playlist_url) return;

        const shareText = `Check out my track on ${placement.playlist_name}! ${placement.playlist_url}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'My Track Placement',
                    text: shareText,
                    url: placement.playlist_url
                });
            } catch (err) {
                // User cancelled or error
                this.copyToClipboard(shareText);
            }
        } else {
            this.copyToClipboard(shareText);
        }
    },

    /**
     * Copy to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

window.Placements = Placements;

document.addEventListener('DOMContentLoaded', () => Placements.init());
