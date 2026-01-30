/**
 * Artist Portal - Track Submission Module
 */

// SUTRA Token Contract on Polygon
const SUTRA_CONTRACT = {
    address: '0x5f76b6b561690bB425F0e131A1AC5E8d0c92C3bB',
    decimals: 18
};

// Treasury wallet for SUTRA payments
const TREASURY_WALLET = '0x742d35Cc6634C0532925a3b844Bc9e7595f5bE21';

// Pricing
const PRICING = {
    pro_usd: 4900, // $49.00 in cents
    pro_sutra: 392 // SUTRA amount (20% discount from ~490)
};

// SUTRA Token ABI (minimal for transfer)
const SUTRA_ABI = [
    {
        "constant": false,
        "inputs": [
            { "name": "_to", "type": "address" },
            { "name": "_value", "type": "uint256" }
        ],
        "name": "transfer",
        "outputs": [{ "name": "", "type": "bool" }],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{ "name": "_owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "name": "balance", "type": "uint256" }],
        "type": "function"
    }
];

const Submit = {
    trackData: null,
    stripe: null,
    selectedGenres: [],
    availableGenres: [],

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
                this.updatePaymentVisibility();
            });
        });

        // Set initial tier selection
        const checkedTier = document.querySelector('input[name="tier"]:checked');
        if (checkedTier) {
            checkedTier.closest('.tier-option').classList.add('selected');
        }

        // Payment method selection
        const paymentOptions = document.querySelectorAll('.payment-option input');
        paymentOptions.forEach(option => {
            option.addEventListener('change', () => this.updatePaymentUI());
        });

        // Initialize payment visibility
        this.updatePaymentVisibility();
        this.updateWalletStatus();

        // Form submission
        const form = document.getElementById('submit-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Update submit button state
        this.updateSubmitButton();
    },

    /**
     * Fetch track info and analyze genres
     */
    async fetchTrackInfo() {
        const urlInput = document.getElementById('spotify-url');
        const fetchBtn = document.getElementById('fetch-btn');
        const preview = document.getElementById('track-preview');
        const genreSection = document.getElementById('genre-section');

        const url = urlInput.value.trim();
        if (!url) return;

        // Validate URL format
        if (!url.includes('spotify.com/track/') && !url.includes('spotify:track:')) {
            this.showError('Please enter a valid Spotify track URL');
            return;
        }

        // Show loading state
        fetchBtn.disabled = true;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Analyzing...</span>';

        try {
            // Call the track analyzer endpoint
            const response = await fetch(`${ArtistAuth.API_BASE.replace('/artist-portal', '')}/tracks/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spotify_url: url })
            });

            const data = await response.json();

            if (data.error) {
                this.showError(data.error);
                return;
            }

            this.trackData = data;
            this.availableGenres = data.available_genres || [];

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

            // Show AI prediction
            const predictionText = document.getElementById('prediction-text');
            const predictionReasoning = document.getElementById('prediction-reasoning');
            const primaryGenre = data.predicted_primary_genre;
            const secondaryGenre = data.predicted_secondary_genre;

            if (primaryGenre) {
                let html = `We think this is <strong>${primaryGenre}</strong>`;
                if (secondaryGenre) {
                    html += ` with elements of <strong>${secondaryGenre}</strong>`;
                }
                predictionText.innerHTML = html;
                predictionReasoning.textContent = data.prediction_reasoning || '';
            } else {
                predictionText.innerHTML = 'Select the genres that best match your track';
                predictionReasoning.textContent = '';
            }

            // Render genre buttons and pre-select predicted genres
            this.renderGenreButtons(primaryGenre, secondaryGenre);

            // Show preview and genre section
            preview.classList.remove('hidden');
            preview.classList.add('show');
            genreSection.style.display = 'block';

            // Update submit button
            this.updateSubmitButton();

        } catch (error) {
            console.error('Fetch error:', error);
            this.showError('Failed to analyze track. Please try again.');
        } finally {
            fetchBtn.disabled = false;
            fetchBtn.innerHTML = '<i class="fab fa-spotify"></i> <span>Fetch</span>';
        }
    },

    /**
     * Render genre selection buttons
     */
    renderGenreButtons(predictedPrimary, predictedSecondary) {
        const container = document.getElementById('genre-buttons');

        // Pre-select predicted genres
        this.selectedGenres = [];
        if (predictedPrimary) this.selectedGenres.push(predictedPrimary);
        if (predictedSecondary) this.selectedGenres.push(predictedSecondary);

        container.innerHTML = this.availableGenres.map(genre => {
            const isSelected = this.selectedGenres.includes(genre);
            const isPredicted = genre === predictedPrimary || genre === predictedSecondary;

            return `
                <button
                    type="button"
                    class="genre-btn ${isSelected ? 'selected' : ''} ${isPredicted ? 'predicted' : ''}"
                    onclick="Submit.toggleGenre('${genre}')"
                    data-genre="${genre}">
                    ${genre}
                    ${isPredicted ? '<span class="predicted-badge">AI</span>' : ''}
                </button>
            `;
        }).join('');

        this.updateGenreSelection();
    },

    /**
     * Toggle genre selection
     */
    toggleGenre(genre) {
        const index = this.selectedGenres.indexOf(genre);

        if (index > -1) {
            // Deselect
            this.selectedGenres.splice(index, 1);
        } else {
            // Select (max 2)
            if (this.selectedGenres.length >= 2) {
                this.showError('You can select up to 2 genres. Deselect one first.');
                return;
            }
            this.selectedGenres.push(genre);
        }

        // Update button states
        document.querySelectorAll('.genre-btn').forEach(btn => {
            if (this.selectedGenres.includes(btn.dataset.genre)) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        this.updateGenreSelection();
    },

    /**
     * Update genre selection state
     */
    updateGenreSelection() {
        document.getElementById('selected-count').textContent = this.selectedGenres.length;
        document.getElementById('primary-genre').value = this.selectedGenres[0] || '';
        document.getElementById('secondary-genre').value = this.selectedGenres[1] || '';
        this.updateSubmitButton();
    },

    /**
     * Update submit button state
     */
    updateSubmitButton() {
        const submitBtn = document.getElementById('submit-btn');
        const hasTrack = this.trackData !== null;
        const hasGenre = this.selectedGenres.length > 0;
        const tier = document.querySelector('input[name="tier"]:checked')?.value || 'free';
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'stripe';

        submitBtn.disabled = !hasTrack || !hasGenre;

        // Update button text based on tier and payment method
        if (tier === 'pro') {
            if (paymentMethod === 'sutra') {
                submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Pay ' + PRICING.pro_sutra + ' SUTRA & Start Campaign';
            } else {
                submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Pay $19.95 & Start Campaign';
            }
        } else {
            submitBtn.innerHTML = '<i class="fas fa-rocket"></i> Start Campaign';
        }
    },

    /**
     * Update payment section visibility based on tier
     */
    updatePaymentVisibility() {
        const tier = document.querySelector('input[name="tier"]:checked')?.value || 'free';
        const paymentSection = document.getElementById('payment-section');

        if (paymentSection) {
            if (tier === 'pro') {
                paymentSection.classList.remove('hidden');
            } else {
                paymentSection.classList.add('hidden');
            }
        }

        this.updateSubmitButton();
    },

    /**
     * Update payment UI based on wallet status
     */
    updateWalletStatus() {
        const sutraOption = document.querySelector('input[value="sutra"]');
        const sutraCard = sutraOption?.closest('.payment-option');
        const walletNote = document.getElementById('wallet-note');
        const walletStatusText = document.getElementById('wallet-status-text');

        if (typeof WalletModule !== 'undefined' && WalletModule.isConnected()) {
            const balance = WalletModule.getBalance();
            const canAfford = balance >= PRICING.pro_sutra;

            if (sutraCard) {
                sutraCard.classList.remove('disabled');
                sutraOption.disabled = !canAfford;
            }

            if (walletStatusText) {
                if (canAfford) {
                    walletStatusText.innerHTML = `Wallet connected: ${balance.toFixed(2)} SUTRA available`;
                    walletNote.style.background = '#d1fae5';
                } else {
                    walletStatusText.innerHTML = `Insufficient balance: ${balance.toFixed(2)} SUTRA (need ${PRICING.pro_sutra})`;
                    walletNote.style.background = '#fef3c7';
                }
            }
        } else {
            if (sutraCard) {
                sutraCard.classList.add('disabled');
                sutraOption.disabled = true;
            }
            if (walletStatusText) {
                walletStatusText.innerHTML = 'Connect your wallet to pay with SUTRA';
            }
            // Switch to Stripe if SUTRA was selected
            const stripeOption = document.querySelector('input[value="stripe"]');
            if (stripeOption && sutraOption?.checked) {
                stripeOption.checked = true;
            }
        }

        this.updateSubmitButton();
    },

    /**
     * Update payment UI
     */
    updatePaymentUI() {
        this.updateSubmitButton();
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
        const tier = document.querySelector('input[name="tier"]:checked').value;
        const paymentMethod = document.querySelector('input[name="payment_method"]:checked')?.value || 'stripe';

        submitBtn.disabled = true;

        const formData = {
            spotify_url: document.getElementById('spotify-url').value.trim(),
            track_title: document.getElementById('track-title-input').value,
            artist_name: document.getElementById('artist-name-input').value,
            artwork_url: document.getElementById('artwork-url-input').value,
            genre: this.selectedGenres[0] || '',
            secondary_genre: this.selectedGenres[1] || null,
            pitch: document.getElementById('pitch').value.trim(),
            tier: tier,
            payment_method: tier === 'pro' ? paymentMethod : null
        };

        // Handle Pro tier payment
        if (tier === 'pro') {
            if (paymentMethod === 'sutra') {
                // Process SUTRA payment
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing SUTRA Payment...';
                const paymentResult = await this.processSutraPayment();
                if (!paymentResult.success) {
                    this.showError(paymentResult.error || 'SUTRA payment failed');
                    submitBtn.disabled = false;
                    this.updateSubmitButton();
                    return;
                }
                formData.payment_tx = paymentResult.txHash;
                formData.payment_amount_sutra = PRICING.pro_sutra;
            } else {
                // Redirect to Stripe checkout
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Redirecting to Payment...';
                await this.processStripePayment(formData);
                return; // Stripe will redirect, don't continue
            }
        }

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Campaign...';

        try {
            const response = await ArtistAuth.apiRequest('/submit', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                // Show success modal
                document.getElementById('success-modal').classList.remove('hidden');
            } else {
                this.showError(result.error || 'Failed to create campaign');
                submitBtn.disabled = false;
                this.updateSubmitButton();
            }
        } catch (error) {
            console.error('Submit error:', error);
            this.showError('Failed to create campaign. Please try again.');
            submitBtn.disabled = false;
            this.updateSubmitButton();
        }
    },

    /**
     * Process SUTRA payment on-chain
     */
    async processSutraPayment() {
        if (typeof WalletModule === 'undefined' || !WalletModule.isConnected()) {
            return { success: false, error: 'Wallet not connected' };
        }

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            const sutraContract = new ethers.Contract(
                SUTRA_CONTRACT.address,
                SUTRA_ABI,
                signer
            );

            const amountWei = ethers.utils.parseUnits(PRICING.pro_sutra.toString(), 18);

            // Execute transfer
            const tx = await sutraContract.transfer(TREASURY_WALLET, amountWei);
            const receipt = await tx.wait();

            return {
                success: true,
                txHash: receipt.transactionHash,
                amount: PRICING.pro_sutra
            };
        } catch (error) {
            console.error('SUTRA payment error:', error);
            if (error.code === 4001) {
                return { success: false, error: 'Transaction rejected by user' };
            }
            return { success: false, error: error.message || 'Payment failed' };
        }
    },

    /**
     * Process Stripe payment (redirect to checkout)
     */
    async processStripePayment(formData) {
        try {
            // Create checkout session on backend
            const response = await ArtistAuth.apiRequest('/create-checkout', {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    return_url: window.location.origin + '/artists/dashboard.html?payment=success',
                    cancel_url: window.location.origin + '/artists/submit.html?payment=cancelled'
                })
            });

            const result = await response.json();

            if (result.checkout_url) {
                // Redirect to Stripe
                window.location.href = result.checkout_url;
            } else {
                this.showError(result.error || 'Failed to create payment session');
                document.getElementById('submit-btn').disabled = false;
                this.updateSubmitButton();
            }
        } catch (error) {
            console.error('Stripe setup error:', error);
            this.showError('Payment setup failed. Please try again.');
            document.getElementById('submit-btn').disabled = false;
            this.updateSubmitButton();
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
