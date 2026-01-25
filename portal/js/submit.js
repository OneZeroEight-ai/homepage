/**
 * Artist Portal - Track Submission Module
 */

const Submit = {
    trackData: null,

    /**
     * Initialize submission page
     */
    async init() {
        await ArtistAuth.initPage((artist) => {
            this.updateUserInfo(artist);
        });

        this.initSidebar();
        this.initForm();
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
     * Initialize form handlers
     */
    initForm() {
        // Fetch button
        const fetchBtn = document.getElementById('fetch-btn');
        if (fetchBtn) {
            fetchBtn.addEventListener('click', () => this.fetchTrackInfo());
        }

        // URL input - fetch on Enter
        const urlInput = document.getElementById('spotify-url');
        if (urlInput) {
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.fetchTrackInfo();
                }
            });

            // Also auto-fetch when pasting
            urlInput.addEventListener('paste', () => {
                setTimeout(() => this.fetchTrackInfo(), 100);
            });
        }

        // Pitch character counter
        const pitchInput = document.getElementById('pitch');
        const pitchCount = document.getElementById('pitch-count');
        if (pitchInput && pitchCount) {
            pitchInput.addEventListener('input', () => {
                pitchCount.textContent = pitchInput.value.length;
            });
        }

        // Tier selection
        const tierOptions = document.querySelectorAll('.tier-option');
        tierOptions.forEach(option => {
            option.addEventListener('click', () => {
                tierOptions.forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                option.querySelector('input[type="radio"]').checked = true;
            });
        });

        // Set initial tier selection
        const checkedTier = document.querySelector('input[name="tier"]:checked');
        if (checkedTier) {
            checkedTier.closest('.tier-option').classList.add('selected');
        }

        // Form submission
        const form = document.getElementById('submit-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Update submit button state
        this.updateSubmitButton();
    },

    /**
     * Fetch track info from Spotify URL
     */
    async fetchTrackInfo() {
        const urlInput = document.getElementById('spotify-url');
        const fetchBtn = document.getElementById('fetch-btn');
        const preview = document.getElementById('track-preview');

        const url = urlInput.value.trim();
        if (!url) return;

        // Validate URL format
        if (!url.includes('spotify.com/track/') && !url.includes('spotify:track:')) {
            this.showError('Please enter a valid Spotify track URL');
            return;
        }

        // Show loading state
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Loading...</span>';

        try {
            const response = await ArtistAuth.apiRequest(`/track-info?url=${encodeURIComponent(url)}`);
            const data = await response.json();

            if (data.success) {
                this.trackData = data;

                // Update preview
                const artworkEl = document.getElementById('track-artwork');
                const titleEl = document.getElementById('track-title');
                const artistEl = document.getElementById('track-artist');

                if (data.thumbnail_url) {
                    artworkEl.innerHTML = `<img src="${data.thumbnail_url}" alt="Album art">`;
                }
                titleEl.textContent = data.track_title || 'Unknown Track';
                artistEl.textContent = data.artist_name || 'Unknown Artist';

                // Set hidden fields
                document.getElementById('track-title-input').value = data.track_title || '';
                document.getElementById('artist-name-input').value = data.artist_name || '';
                document.getElementById('artwork-url-input').value = data.thumbnail_url || '';

                // Auto-select genre if detected
                if (data.primary_genre) {
                    const genreSelect = document.getElementById('genre');
                    const genreOption = Array.from(genreSelect.options).find(
                        opt => opt.value.toLowerCase() === data.primary_genre.toLowerCase()
                    );
                    if (genreOption) {
                        genreSelect.value = genreOption.value;
                    }
                }

                // Show preview
                preview.classList.remove('hidden');
                preview.classList.add('show');

                // Update submit button
                this.updateSubmitButton();
            } else {
                this.showError(data.error || 'Failed to fetch track info');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            this.showError('Failed to fetch track info. Please check the URL and try again.');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = '<i class="fab fa-spotify"></i> <span>Fetch</span>';
        }
    },

    /**
     * Update submit button state
     */
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        const hasTrack = this.trackData !== null;
        const hasGenre = document.getElementById('genre').value !== '';

        submitBtn.disabled = !hasTrack || !hasGenre;
    },

    /**
     * Handle form submission
     */
    async handleSubmit(e) {
        e.preventDefault();

        if (!this.trackData) {
            this.showError('Please fetch track info first');
            return;
        }

        const submitBtn = document.getElementById('submit-btn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Campaign...';

        const formData = {
            spotify_url: document.getElementById('spotify-url').value.trim(),
            track_title: document.getElementById('track-title-input').value,
            artist_name: document.getElementById('artist-name-input').value,
            artwork_url: document.getElementById('artwork-url-input').value,
            genre: document.getElementById('genre').value,
            pitch: document.getElementById('pitch').value.trim(),
            tier: document.querySelector('input[name="tier"]:checked').value
        };

        try {
            const response = await ArtistAuth.apiRequest('/submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Show success modal
                document.getElementById('success-modal').classList.remove('hidden');

                // If Pro tier, might need to redirect to payment
                if (formData.tier === 'pro' && result.payment_url) {
                    window.location.href = result.payment_url;
                }
            } else {
                this.showError(result.error || 'Failed to create campaign');
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Start Campaign';
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showError('Failed to create campaign. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Start Campaign';
        }
    },

    /**
     * Show error message
     */
    showError(message) {
        // Create toast notification
        const existing = document.querySelector('.toast-error');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-error';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }
};

// Make Submit available globally
window.Submit = Submit;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Submit.init());
