/**
 * Interactive Marquee - OneZeroEight.ai
 * Playlist & Agent Showcase with Modals and Background Playback
 */

// ============================================
// Agent Data (16 Genre Specialists)
// ============================================
const AGENTS_DATA = {
    Pulse: {
        name: "Pulse",
        emoji: "⚡",
        genre: "Electronic/EDM",
        personality: "High-energy and precise",
        primary: "#00D4FF",
        secondary: "#0A0A1A",
        keywords: ["neon", "circuits", "geometric", "futuristic", "electric"],
        subject: "⚡ High-energy track for your playlist",
        opening: "Hey, Pulse here from OneZeroEight.",
        voice: "Direct, energetic, gets to the point quickly",
        signoff: "Stay electric, Pulse",
        placements: 47,
        rate: 68,
        rank: 3
    },
    Flow: {
        name: "Flow",
        emoji: "🎤",
        genre: "Hip-Hop/Rap",
        personality: "Sharp and culturally connected",
        primary: "#FFD700",
        secondary: "#1A1A2E",
        keywords: ["urban", "gold", "graffiti", "bold", "street"],
        subject: "🎤 Fresh heat for your playlist",
        opening: "What's good, Flow checking in from OneZeroEight.",
        voice: "Confident, culturally aware, authentic",
        signoff: "Keep it real, Flow",
        placements: 52,
        rate: 72,
        rank: 2
    },
    Haze: {
        name: "Haze",
        emoji: "🌙",
        genre: "Lo-Fi/Chill",
        personality: "Laid-back and atmospheric",
        primary: "#9B7EDE",
        secondary: "#1A1625",
        keywords: ["dreamy", "soft", "anime", "nostalgic", "cozy"],
        subject: "🌙 Chill vibes for your playlist",
        opening: "Hey there, Haze here from OneZeroEight.",
        voice: "Calm, thoughtful, relaxed",
        signoff: "Stay cozy, Haze",
        placements: 89,
        rate: 74,
        rank: 1
    },
    Velvet: {
        name: "Velvet",
        emoji: "💜",
        genre: "R&B/Soul",
        personality: "Smooth and emotionally intelligent",
        primary: "#8B5CF6",
        secondary: "#1A0A2E",
        keywords: ["luxurious", "smooth", "warm", "elegant"],
        subject: "💜 Smooth vibes for your playlist",
        opening: "Hi, Velvet here from OneZeroEight.",
        voice: "Warm, sophisticated, emotionally intelligent",
        signoff: "With soul, Velvet",
        placements: 41,
        rate: 65,
        rank: 5
    },
    Spark: {
        name: "Spark",
        emoji: "✨",
        genre: "Pop",
        personality: "Bright and trend-aware",
        primary: "#FF6B9D",
        secondary: "#2A1520",
        keywords: ["bright", "sparkles", "energetic", "trendy"],
        subject: "✨ Pop magic for your playlist",
        opening: "Hey! Spark here from OneZeroEight.",
        voice: "Upbeat, friendly, trend-conscious",
        signoff: "Shine on, Spark",
        placements: 63,
        rate: 70,
        rank: 4
    },
    Edge: {
        name: "Edge",
        emoji: "🎸",
        genre: "Rock/Alternative",
        personality: "Raw and authentic",
        primary: "#DC2626",
        secondary: "#1A1A1A",
        keywords: ["gritty", "distressed", "raw", "rebellious"],
        subject: "🎸 Raw energy for your playlist",
        opening: "Hey, Edge here from OneZeroEight.",
        voice: "Direct, no-nonsense, authentic",
        signoff: "Rock on, Edge",
        placements: 34,
        rate: 62,
        rank: 8
    },
    Scout: {
        name: "Scout",
        emoji: "🔍",
        genre: "Indie",
        personality: "Curious and discovery-focused",
        primary: "#D97706",
        secondary: "#1A1508",
        keywords: ["vintage", "earthy", "exploratory", "authentic"],
        subject: "🔍 Discovered something for your playlist",
        opening: "Hey, Scout here — found your playlist while hunting for great taste.",
        voice: "Curious, discovery-focused, authentic",
        signoff: "Keep discovering, Scout",
        placements: 56,
        rate: 69,
        rank: 6
    },
    Sage: {
        name: "Sage",
        emoji: "🍃",
        genre: "Folk/Acoustic",
        personality: "Warm and storytelling-focused",
        primary: "#059669",
        secondary: "#0A1A10",
        keywords: ["natural", "forest", "acoustic", "warm"],
        subject: "🍃 A story for your playlist",
        opening: "Hi there, Sage here from OneZeroEight.",
        voice: "Warm, sincere, storytelling",
        signoff: "With warmth, Sage",
        placements: 28,
        rate: 64,
        rank: 10
    },
    Drift: {
        name: "Drift",
        emoji: "🌊",
        genre: "Ambient",
        personality: "Contemplative and expansive",
        primary: "#0EA5E9",
        secondary: "#0A1628",
        keywords: ["ethereal", "flowing", "oceanic", "meditative"],
        subject: "🌊 Ambient waves for your playlist",
        opening: "Hello, Drift here from OneZeroEight.",
        voice: "Calm, thoughtful, expansive",
        signoff: "Float on, Drift",
        placements: 31,
        rate: 66,
        rank: 9
    },
    Miles: {
        name: "Miles",
        emoji: "🎺",
        genre: "Jazz/Blues",
        personality: "Sophisticated and improvisational",
        primary: "#CA8A04",
        secondary: "#1C1917",
        keywords: ["smoky", "classic", "noir", "sophisticated"],
        subject: "🎺 Smooth jazz for your playlist",
        opening: "Hey, Miles here from OneZeroEight.",
        voice: "Smooth, sophisticated, knowledgeable",
        signoff: "Stay cool, Miles",
        placements: 24,
        rate: 61,
        rank: 11
    },
    Aria: {
        name: "Aria",
        emoji: "🎻",
        genre: "Classical",
        personality: "Refined and detail-oriented",
        primary: "#A16207",
        secondary: "#1A1508",
        keywords: ["elegant", "orchestral", "timeless", "refined"],
        subject: "🎻 Classical elegance for your playlist",
        opening: "Greetings, Aria here from OneZeroEight.",
        voice: "Elegant, precise, cultured",
        signoff: "With grace, Aria",
        placements: 18,
        rate: 58,
        rank: 14
    },
    Ritmo: {
        name: "Ritmo",
        emoji: "💃",
        genre: "Latin",
        personality: "Passionate and rhythmic",
        primary: "#EA580C",
        secondary: "#1A0E05",
        keywords: ["vibrant", "passionate", "rhythmic", "dynamic"],
        subject: "💃 Latin fire for your playlist",
        opening: "Hola! Ritmo here from OneZeroEight.",
        voice: "Energetic, passionate, rhythmic",
        signoff: "Con ritmo, Ritmo",
        placements: 38,
        rate: 67,
        rank: 7
    },
    Forge: {
        name: "Forge",
        emoji: "🔥",
        genre: "Metal",
        personality: "Intense and uncompromising",
        primary: "#B91C1C",
        secondary: "#0A0A0A",
        keywords: ["dark", "flames", "iron", "aggressive"],
        subject: "🔥 Metal fury for your playlist",
        opening: "Forge here from OneZeroEight.",
        voice: "Intense, direct, powerful",
        signoff: "Forged in fire, Forge",
        placements: 22,
        rate: 59,
        rank: 12
    },
    Dusty: {
        name: "Dusty",
        emoji: "🤠",
        genre: "Country",
        personality: "Down-to-earth and heartfelt",
        primary: "#92400E",
        secondary: "#1A1208",
        keywords: ["rustic", "Americana", "warm", "honest"],
        subject: "🤠 Country heart for your playlist",
        opening: "Howdy, Dusty here from OneZeroEight.",
        voice: "Friendly, genuine, down-to-earth",
        signoff: "Ride on, Dusty",
        placements: 19,
        rate: 57,
        rank: 13
    },
    Atlas: {
        name: "Atlas",
        emoji: "🌍",
        genre: "World/Global",
        personality: "Globally-minded and eclectic",
        primary: "#0D9488",
        secondary: "#081A18",
        keywords: ["global", "cultural", "diverse", "connected"],
        subject: "🌍 World sounds for your playlist",
        opening: "Hello, Atlas here from OneZeroEight.",
        voice: "Worldly, curious, inclusive",
        signoff: "Around the world, Atlas",
        placements: 15,
        rate: 55,
        rank: 15
    },
    Harmony: {
        name: "Harmony",
        emoji: "🎵",
        genre: "All Genres",
        personality: "Versatile and supportive",
        primary: "#7C3AED",
        secondary: "#1E1B4B",
        keywords: ["balanced", "musical", "adaptable", "unified"],
        subject: "🎵 Perfect fit for your playlist",
        opening: "Hey there, Harmony here from OneZeroEight.",
        voice: "Friendly, adaptable, supportive",
        signoff: "In harmony, Harmony",
        placements: 67,
        rate: 71,
        rank: 2
    }
};

// ============================================
// Genre to Agent Mapping
// ============================================
const GENRE_AGENT_MAP = {
    "electronic": "Pulse",
    "edm": "Pulse",
    "dance": "Pulse",
    "techno": "Pulse",
    "house": "Pulse",
    "hip-hop": "Flow",
    "hiphop": "Flow",
    "rap": "Flow",
    "trap": "Flow",
    "lo-fi": "Haze",
    "lofi": "Haze",
    "chill": "Haze",
    "chillhop": "Haze",
    "r&b": "Velvet",
    "rnb": "Velvet",
    "soul": "Velvet",
    "neo-soul": "Velvet",
    "pop": "Spark",
    "rock": "Edge",
    "alternative": "Edge",
    "alt": "Edge",
    "punk": "Edge",
    "indie": "Scout",
    "indie-pop": "Scout",
    "indie-rock": "Scout",
    "folk": "Sage",
    "acoustic": "Sage",
    "singer-songwriter": "Sage",
    "ambient": "Drift",
    "downtempo": "Drift",
    "jazz": "Miles",
    "blues": "Miles",
    "classical": "Aria",
    "cinematic": "Aria",
    "orchestral": "Aria",
    "latin": "Ritmo",
    "reggaeton": "Ritmo",
    "salsa": "Ritmo",
    "metal": "Forge",
    "hard-rock": "Forge",
    "country": "Dusty",
    "americana": "Dusty",
    "world": "Atlas",
    "global": "Atlas"
};

function getAgentForGenre(genre) {
    if (!genre) return "Harmony";
    const normalized = genre.toLowerCase().trim();
    return GENRE_AGENT_MAP[normalized] || "Harmony";
}

// ============================================
// Fallback Playlist Data
// ============================================
// OneZeroEight Official Playlists - Real Spotify IDs
const FALLBACK_PLAYLISTS = [
    // Row 1 - Primary genres
    {name:"⚡ Electronic",curator:"OneZeroEight",followers:"3K+",genre:"Electronic",spotifyId:"1QDLk6PVWoNZgqOU4eVowV",desc:"Electronic bangers curated by Pulse. EDM, house, techno, and everything that moves.",image:null},
    {name:"🎤 Hip Hop",curator:"OneZeroEight",followers:"3K+",genre:"Hip-Hop",spotifyId:"7awVYiLk5EA3b6XgraQpem",desc:"The sharpest bars and hardest beats. Flow's selections from boom-bap to trap.",image:null},
    {name:"☕ Lo-Fi & Chill",curator:"OneZeroEight",followers:"3K+",genre:"Lo-Fi",spotifyId:"4UxQQTkDM1lMPzcR2ofpNB",desc:"Cozy beats for studying, relaxing, or drifting off. Haze-approved vibes.",image:null},
    {name:"💜 R&B & Soul",curator:"OneZeroEight",followers:"3K+",genre:"R&B",spotifyId:"28CI6nHmaBDMZ1grSYoL4y",desc:"Smooth R&B and neo-soul. Velvet textures, pure emotion.",image:null},
    {name:"✨ Pop",curator:"OneZeroEight",followers:"3K+",genre:"Pop",spotifyId:"1WLd37m8nWFIq7y6yZetto",desc:"The biggest pop anthems and rising hits. Spark's picks.",image:null},
    {name:"🎸 Rock & Alternative",curator:"OneZeroEight",followers:"3K+",genre:"Rock",spotifyId:"60Hp0raJkuDyjvr2M6iwnk",desc:"Raw guitars, heavy riffs, and unfiltered energy. Edge's domain.",image:null},
    {name:"🍂 Indie & Folk",curator:"OneZeroEight",followers:"3K+",genre:"Indie",spotifyId:"6IVrZl1UiMba2V1A01zntL",desc:"Undiscovered indie and folk tracks. Scout and Sage approved.",image:null},
    {name:"🌙 Ambient",curator:"OneZeroEight",followers:"3K+",genre:"Ambient",spotifyId:"5DqBzx9ou98BcehqkF2dXs",desc:"Ambient soundscapes for meditation and focus. Drift's selections.",image:null},
    {name:"🎷 Jazz & Blues",curator:"OneZeroEight",followers:"3K+",genre:"Jazz",spotifyId:"3NzKhKUj8sUaDm3p85gMMv",desc:"Smoky jazz and slow blues. Miles' golden-era soul picks.",image:null},
    {name:"🎻 Classical & Cinematic",curator:"OneZeroEight",followers:"3K+",genre:"Classical",spotifyId:"2vvYwga5AY35LXCpUf1mEm",desc:"Timeless classical and cinematic scores. Aria's refined selections.",image:null},
    {name:"🔥 Latin",curator:"OneZeroEight",followers:"3K+",genre:"Latin",spotifyId:"2FouNlNr5Z86JkGqH1Z9lq",desc:"Hot Latin beats — reggaeton, salsa, bossa nova. Ritmo's fire.",image:null},
    // Row 2 - Secondary genres
    {name:"🌍 World & Global",curator:"OneZeroEight",followers:"3K+",genre:"World",spotifyId:"0P4mQy5bjTz5QUXnh9XAxC",desc:"Music without borders. Atlas brings sounds from every continent.",image:null},
    {name:"🤠 Country",curator:"OneZeroEight",followers:"3K+",genre:"Country",spotifyId:"5H31gmiH3MD9nflKmQtkS1",desc:"Country roads and heartland stories. Dusty's highways.",image:null},
    {name:"🙏 Gospel & Christian",curator:"OneZeroEight",followers:"3K+",genre:"Gospel",spotifyId:"0qs0ALpOZEQyPZl54ZketH",desc:"Uplifting gospel and Christian music. Faith-forward selections.",image:null},
    {name:"🎵 Discoveries",curator:"OneZeroEight",followers:"3K+",genre:"Other",spotifyId:"2DjGILNUx6ZKj6UFANaWrH",desc:"Genre-defying discoveries. Harmony's eclectic picks from across the spectrum.",image:null},
    {name:"⚡ Electronic Vol. 2",curator:"OneZeroEight",followers:"3K+",genre:"Electronic",spotifyId:"1QDLk6PVWoNZgqOU4eVowV",desc:"More electronic heat from Pulse. Bass-heavy and peak-time ready.",image:null}
];

// ============================================
// State
// ============================================
let loadedPlaylists = [];
let currentModal = null;
let bgPlaylistName = null;
let bgPlaylistEmoji = null;

// ============================================
// API & Data Loading
// ============================================
const MARQUEE_API = "https://onezeroeight-backend-production.up.railway.app/api";

async function loadFeaturedPlaylists() {
    try {
        const res = await fetch(`${MARQUEE_API}/tracks/playlists/featured?limit=32`);
        if (!res.ok) throw new Error("API error");
        const data = await res.json();
        const playlists = data.playlists || data || [];

        if (playlists.length < 8) {
            throw new Error("Not enough playlists");
        }

        // Map API response to our format
        return playlists.map(p => ({
            name: p.name || "Untitled Playlist",
            curator: p.curator_name || p.curator || "Curator",
            followers: formatFollowers(p.followers),
            genre: p.genre || p.genres?.[0] || "Music",
            spotifyId: p.spotify_playlist_id || p.spotify_id || extractSpotifyId(p.spotify_url),
            desc: p.description || `A curated selection of ${p.genre || "great"} tracks.`,
            image: p.image_url || p.cover_url || null
        }));
    } catch (err) {
        console.warn("Using fallback playlist data:", err.message);
        return FALLBACK_PLAYLISTS;
    }
}

function formatFollowers(num) {
    if (!num) return "1K";
    if (typeof num === "string") return num;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
}

function extractSpotifyId(url) {
    if (!url) return null;
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

// ============================================
// Marquee Rendering
// ============================================
function renderPlaylistCard(playlist, index) {
    const agent = AGENTS_DATA[getAgentForGenre(playlist.genre)];
    const agentLower = agent.name.toLowerCase();
    const defaultCover = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="${encodeURIComponent(agent.secondary)}" width="100" height="100"/><text x="50" y="58" font-size="40" text-anchor="middle" fill="${encodeURIComponent(agent.primary)}">🎵</text></svg>`;

    return `
        <div class="im-playlist-card" data-playlist-index="${index}">
            <div class="im-card-accent" style="background:linear-gradient(90deg,${agent.primary},${agent.secondary})"></div>
            <div class="im-card-body">
                <div class="im-cover-wrap">
                    <div class="im-cover">
                        <img src="${playlist.image || defaultCover}" alt="${escapeHtml(playlist.name)}" loading="lazy" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'im-cover-fallback\\' style=\\'background:${agent.secondary}\\'>🎵</div>'">
                        <div class="im-play-hint">▶</div>
                    </div>
                    <div class="im-agent-overlap" data-agent="${agent.name}"
                         title="${agent.emoji} ${agent.name} — ${agent.genre} Specialist"
                         style="--agent-glow:${agent.primary}"
                         onmouseover="this.style.boxShadow='0 0 16px ${agent.primary}'"
                         onmouseout="this.style.boxShadow='0 2px 8px rgba(0,0,0,.4)'">
                        <img src="images/agents/${agentLower}_avatar.png"
                             alt="${agent.name}"
                             onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'im-agent-fallback\\' style=\\'background:${agent.primary}\\'>${agent.emoji}</div>'">
                    </div>
                </div>
                <div class="im-card-info">
                    <div class="im-card-name">${escapeHtml(playlist.name)}</div>
                    <div class="im-card-curator">by ${escapeHtml(playlist.curator)}</div>
                    <div class="im-card-meta">
                        <span class="im-card-followers">${playlist.followers}</span>
                        <span class="im-card-genre">${escapeHtml(playlist.genre)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderAgentCard(agent) {
    const agentLower = agent.name.toLowerCase();

    return `
        <div class="im-agent-card" data-agent="${agent.name}" style="border-color:${agent.primary}30">
            <div class="im-agent-avatar">
                <img src="images/agents/${agentLower}_avatar.png"
                     alt="${agent.name}"
                     onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'im-agent-avatar-fallback\\' style=\\'background:${agent.secondary}\\'>${agent.emoji}</div>'">
            </div>
            <div class="im-agent-info">
                <div class="im-agent-name" style="color:${agent.primary}">${agent.emoji} ${agent.name}</div>
                <div class="im-agent-genre-label">${agent.genre}</div>
            </div>
        </div>
    `;
}

function buildMarquee() {
    const playlists = loadedPlaylists;
    const agents = Object.values(AGENTS_DATA);

    // Row 1: First batch of playlists
    const row1Playlists = playlists.slice(0, 11);
    const row1Items = row1Playlists.map((p, i) => renderPlaylistCard(p, i)).join('');

    // Row 2: All agents
    const row2Items = agents.map(agent => renderAgentCard(agent)).join('');

    // Row 3: Remaining playlists
    const row3Playlists = playlists.slice(11);
    const row3Items = row3Playlists.map((p, i) => renderPlaylistCard(p, 11 + i)).join('');

    // Populate rows (duplicate content for seamless loop)
    const row1El = document.getElementById('im-row-1');
    const row2El = document.getElementById('im-row-2');
    const row3El = document.getElementById('im-row-3');

    if (row1El) row1El.innerHTML = row1Items + row1Items;
    if (row2El) row2El.innerHTML = row2Items + row2Items;
    if (row3El) row3El.innerHTML = row3Items + row3Items;

    console.log('[Marquee] Row 1:', row1El?.children.length, 'items');
    console.log('[Marquee] Row 2:', row2El?.children.length, 'items');
    console.log('[Marquee] Row 3:', row3El?.children.length, 'items');
}

// ============================================
// Modal Functions
// ============================================
function openPlaylistModal(playlistName) {
    const playlist = loadedPlaylists.find(p => p.name === playlistName);
    if (!playlist) return;

    const playlistIndex = loadedPlaylists.indexOf(playlist);
    const agent = AGENTS_DATA[getAgentForGenre(playlist.genre)];
    const agentLower = agent.name.toLowerCase();

    const modalHtml = `
        <div class="im-modal">
            <button class="im-modal-close" data-action="close">&times;</button>
            <div class="im-modal-hero" style="background:linear-gradient(180deg,${agent.secondary} 0%,var(--im-surface) 100%)">
                <div class="im-modal-cover">
                    <img src="${playlist.image || ''}" alt="${escapeHtml(playlist.name)}"
                         onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${agent.secondary};font-size:48px\\'>🎵</div>'">
                </div>
                <h2 class="im-modal-title">${escapeHtml(playlist.name)}</h2>
                <div class="im-modal-badges">
                    <span class="im-badge im-badge-genre">${escapeHtml(playlist.genre)}</span>
                    <span class="im-badge im-badge-followers">${playlist.followers} followers</span>
                </div>
            </div>
            <div class="im-modal-body">
                <div class="im-modal-section">
                    <div class="im-modal-section-title">About</div>
                    <p class="im-modal-desc">${escapeHtml(playlist.desc)}</p>
                </div>

                <div class="im-modal-section">
                    <div class="im-modal-section-title">Listen Now</div>
                    <div class="im-spotify-embed">
                        <iframe src="https://open.spotify.com/embed/playlist/${playlist.spotifyId}?utm_source=generator&theme=0"
                                height="352" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"></iframe>
                    </div>
                </div>

                <div class="im-modal-section">
                    <button class="im-play-bg-btn" data-action="play-bg" data-spotify-id="${playlist.spotifyId}" data-playlist-index="${playlistIndex}" data-emoji="${agent.emoji}" style="background:${agent.primary}">
                        <span>▶</span> Play in Background
                    </button>
                </div>

                <div class="im-modal-section">
                    <div class="im-modal-section-title">Assigned Agent</div>
                    <div class="im-agent-link" data-action="open-agent" data-agent="${agent.name}">
                        <div class="im-agent-link-avatar">
                            <img src="images/agents/${agentLower}_avatar.png" alt="${agent.name}"
                                 onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${agent.secondary};font-size:24px\\'>${agent.emoji}</div>'">
                        </div>
                        <div class="im-agent-link-info">
                            <div class="im-agent-link-name" style="color:${agent.primary}">${agent.emoji} ${agent.name}</div>
                            <div class="im-agent-link-meta">${agent.genre} Specialist • ${agent.placements} placements</div>
                        </div>
                        <div class="im-agent-link-arrow">→</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

function openAgentModal(agentName) {
    const agent = AGENTS_DATA[agentName];
    if (!agent) return;

    const agentLower = agent.name.toLowerCase();

    // Find playlists for this agent
    const agentPlaylists = loadedPlaylists.filter(p => getAgentForGenre(p.genre) === agentName);

    const playlistListHtml = agentPlaylists.slice(0, 5).map(p => {
        const idx = loadedPlaylists.indexOf(p);
        return `
        <div class="im-playlist-list-item" data-action="open-playlist" data-playlist-index="${idx}">
            <div class="im-playlist-list-cover">
                <img src="${p.image || ''}" alt="${escapeHtml(p.name)}"
                     onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${agent.secondary};font-size:16px\\'>🎵</div>'">
            </div>
            <div class="im-playlist-list-info">
                <div class="im-playlist-list-name">${escapeHtml(p.name)}</div>
                <div class="im-playlist-list-meta">${p.followers} followers</div>
            </div>
        </div>
    `}).join('') || '<p style="color:var(--im-text-dim);font-size:13px;">No playlists currently assigned.</p>';

    const modalHtml = `
        <div class="im-modal">
            <button class="im-modal-close" data-action="close">&times;</button>
            <div class="im-modal-hero" style="background:radial-gradient(circle at 50% 0%,${agent.primary}30 0%,${agent.secondary} 70%,var(--im-surface) 100%)">
                <div class="im-modal-avatar">
                    <img src="images/agents/${agentLower}_avatar.png" alt="${agent.name}"
                         onerror="this.parentElement.innerHTML='<div style=\\'width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${agent.secondary};font-size:48px\\'>${agent.emoji}</div>'">
                </div>
                <h2 class="im-modal-title" style="color:${agent.primary}">${agent.emoji} ${agent.name}</h2>
                <div class="im-modal-curator">${agent.genre} Specialist</div>
                <p class="im-modal-personality">"${agent.personality}"</p>
                <div class="im-modal-stats">
                    <div class="im-stat">
                        <div class="im-stat-value">${agent.placements}</div>
                        <div class="im-stat-label">Placements</div>
                    </div>
                    <div class="im-stat">
                        <div class="im-stat-value">${agent.rate}%</div>
                        <div class="im-stat-label">Success Rate</div>
                    </div>
                    <div class="im-stat">
                        <div class="im-stat-value">#${agent.rank}</div>
                        <div class="im-stat-label">Rank</div>
                    </div>
                </div>
            </div>
            <div class="im-modal-body">
                <div class="im-modal-section">
                    <div class="im-modal-section-title">Visual Identity</div>
                    <div class="im-colors">
                        <div class="im-color-swatch">
                            <div class="im-swatch" style="background:${agent.primary}"></div>
                            <span class="im-swatch-hex">${agent.primary}</span>
                        </div>
                        <div class="im-color-swatch">
                            <div class="im-swatch" style="background:${agent.secondary}"></div>
                            <span class="im-swatch-hex">${agent.secondary}</span>
                        </div>
                    </div>
                    <div class="im-keywords">
                        ${agent.keywords.map(k => `<span class="im-keyword">${k}</span>`).join('')}
                    </div>
                </div>

                <div class="im-modal-section">
                    <div class="im-modal-section-title">Communication Protocol</div>
                    <div class="im-comm-block">
                        <div class="im-comm-item">
                            <div class="im-comm-label">Subject</div>
                            <div class="im-comm-value">${escapeHtml(agent.subject)}</div>
                        </div>
                        <div class="im-comm-item">
                            <div class="im-comm-label">Opening</div>
                            <div class="im-comm-value">${escapeHtml(agent.opening)}</div>
                        </div>
                        <div class="im-comm-item">
                            <div class="im-comm-label">Voice</div>
                            <div class="im-comm-value">${escapeHtml(agent.voice)}</div>
                        </div>
                    </div>
                    <div class="im-signoff">${escapeHtml(agent.signoff)}</div>
                </div>

                <div class="im-modal-section">
                    <div class="im-modal-section-title">Active Playlists</div>
                    <div class="im-playlist-list">
                        ${playlistListHtml}
                    </div>
                </div>
            </div>
        </div>
    `;

    showModal(modalHtml);
}

function showModal(html) {
    const overlay = document.getElementById('im-modal-overlay');
    overlay.innerHTML = html;
    overlay.classList.add('active');
    currentModal = true;
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const overlay = document.getElementById('im-modal-overlay');
    overlay.classList.remove('active');
    currentModal = null;
    document.body.style.overflow = '';

    // Clear after animation
    setTimeout(() => {
        if (!currentModal) {
            overlay.innerHTML = '';
        }
    }, 300);
}

// ============================================
// Background Playback
// ============================================
function playInBackground(spotifyId, playlistName, emoji) {
    // Set up background player
    const bgPlayer = document.getElementById('im-bg-player');
    bgPlayer.innerHTML = `
        <iframe src="https://open.spotify.com/embed/playlist/${spotifyId}?utm_source=generator&theme=0"
                width="300" height="80" allow="autoplay; clipboard-write; encrypted-media"
                loading="lazy" style="border:none"></iframe>
    `;

    // Update Now Playing bar
    bgPlaylistName = playlistName;
    bgPlaylistEmoji = emoji;
    document.getElementById('im-np-emoji').textContent = emoji;
    document.getElementById('im-np-name').textContent = playlistName;
    document.getElementById('im-now-playing').classList.add('active');

    // Close modal
    closeModal();
}

function stopBackgroundPlayback() {
    document.getElementById('im-bg-player').innerHTML = '';
    document.getElementById('im-now-playing').classList.remove('active');
    bgPlaylistName = null;
    bgPlaylistEmoji = null;
}

// ============================================
// Event Handlers
// ============================================
function setupEventHandlers() {
    // Event delegation for all clicks
    document.addEventListener('click', function(e) {
        // Check for data-action attributes (modal buttons)
        const actionEl = e.target.closest('[data-action]');
        if (actionEl) {
            const action = actionEl.dataset.action;

            if (action === 'close') {
                closeModal();
                return;
            }

            if (action === 'play-bg') {
                const spotifyId = actionEl.dataset.spotifyId;
                const playlistIndex = parseInt(actionEl.dataset.playlistIndex, 10);
                const emoji = actionEl.dataset.emoji;
                const playlist = loadedPlaylists[playlistIndex];
                if (playlist) {
                    playInBackground(spotifyId, playlist.name, emoji);
                }
                return;
            }

            if (action === 'open-agent') {
                const agentName = actionEl.dataset.agent;
                closeModal();
                setTimeout(() => openAgentModal(agentName), 150);
                return;
            }

            if (action === 'open-playlist') {
                const playlistIndex = parseInt(actionEl.dataset.playlistIndex, 10);
                const playlist = loadedPlaylists[playlistIndex];
                if (playlist) {
                    closeModal();
                    setTimeout(() => openPlaylistModal(playlist.name), 150);
                }
                return;
            }
        }

        // Check for playlist card click (marquee)
        const playlistCard = e.target.closest('.im-playlist-card');
        if (playlistCard && !e.target.closest('.im-agent-overlap')) {
            const index = parseInt(playlistCard.dataset.playlistIndex, 10);
            if (!isNaN(index) && loadedPlaylists[index]) {
                openPlaylistModal(loadedPlaylists[index].name);
            }
            return;
        }

        // Check for agent overlap click (on playlist cards)
        const agentOverlap = e.target.closest('.im-agent-overlap');
        if (agentOverlap) {
            e.stopPropagation();
            const agentName = agentOverlap.dataset.agent;
            if (agentName) {
                openAgentModal(agentName);
            }
            return;
        }

        // Check for standalone agent card click
        const agentCard = e.target.closest('.im-agent-card');
        if (agentCard) {
            const agentName = agentCard.dataset.agent;
            if (agentName) {
                openAgentModal(agentName);
            }
            return;
        }
    });

    // Close modal on overlay click
    document.getElementById('im-modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && currentModal) {
            closeModal();
        }
    });
}

// ============================================
// Utility Functions
// ============================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/'/g, '&#39;');
}

// ============================================
// Initialize
// ============================================
async function initInteractiveMarquee() {
    try {
        console.log('[Marquee] Initializing...');
        loadedPlaylists = await loadFeaturedPlaylists();
        console.log('[Marquee] Loaded', loadedPlaylists.length, 'playlists');

        buildMarquee();
        console.log('[Marquee] Built marquee');

        setupEventHandlers();
        console.log('[Marquee] Event handlers set up');

        // Show the section
        const section = document.getElementById('im-section');
        if (section) {
            section.style.display = 'block';
            console.log('[Marquee] Section displayed');
        } else {
            console.error('[Marquee] Section element not found!');
        }
    } catch (err) {
        console.error('[Marquee] Init error:', err);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveMarquee);
} else {
    initInteractiveMarquee();
}
