import '../css/styles.css';
import Chart from 'chart.js/auto';

class SolanaMoonDashboard {
    constructor() {
        this.solanaConnection = null;
        this.wallet = null;
        this.priceChart = null;
        this.activityChart = null;
        this.currentFilter = 'all';
        this.memecoins = [];
        this.priceHistory = [];
        this.volumeHistory = [];
        this.marketCapHistory = [];
        this.athData = null;
        this.atlData = null;
        this.audioEnabled = true;
        this.currentAudioIndex = 0;
        this.audioTracks = [];
        this.init();
    }

    async init() {
        await this.setupMedia();
        this.setupEventListeners();
        this.addMissingStyles();
        this.setupCharts();
        await this.loadSolanaData();
        await this.loadMemecoinData();
        this.startDataRefresh();
        this.showMemeMessages();
        this.enableAudio();
    }

    addMissingStyles() {
        // Add missing styles for enhanced Solana info display
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glow {
                0%, 100% { text-shadow: 0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor; }
                50% { text-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor; }
            }
            
            .solana-details {
                background: rgba(0, 0, 0, 0.6);
                border: 2px solid #00ff88;
                border-radius: 10px;
                padding: 2rem;
                margin: 2rem 0;
                backdrop-filter: blur(10px);
            }
            
            .solana-details h3 {
                color: #00ff88;
                text-align: center;
                margin-bottom: 1.5rem;
                font-size: 1.5rem;
                text-shadow: 0 0 15px #00ff88;
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            .solana-info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 1rem;
            }
            
            .info-item {
                background: rgba(0, 255, 136, 0.1);
                border: 1px solid #00ff88;
                border-radius: 8px;
                padding: 1rem;
                text-align: center;
            }
            
            .info-label {
                color: #888;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .info-value {
                color: #00ff88;
                font-size: 1.2rem;
                font-weight: 700;
            }
            
            .ath-atl-container {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
                margin: 1rem 0;
            }
            
            .ath-card, .atl-card {
                background: rgba(0, 0, 0, 0.6);
                border: 1px solid;
                border-radius: 10px;
                padding: 1rem;
                text-align: center;
                animation: glow 2s ease-in-out infinite alternate;
            }
            
            .ath-card {
                border-color: #00ff88;
                color: #00ff88;
            }
            
            .atl-card {
                border-color: #ff4444;
                color: #ff4444;
            }
            
            .ath-price, .atl-price {
                font-size: 1.5rem;
                font-weight: 900;
                margin: 0.5rem 0;
            }
            
            .ath-date, .atl-date {
                font-size: 0.8rem;
                opacity: 0.7;
            }
            
            .loading {
                color: #00ff88;
                text-align: center;
                padding: 2rem;
                animation: glow 1s ease-in-out infinite alternate;
            }
            
            .error {
                color: #ff4444;
                text-align: center;
                padding: 2rem;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }

    async setupMedia() {
        // Setup background video
        const video = document.querySelector('.background-video');
        if (video) {
            video.addEventListener('loadeddata', () => {
                console.log('🎬 Background video loaded!');
            });
            video.addEventListener('error', (e) => {
                console.error('Video loading error:', e);
            });
        }

        // Setup audio tracks with MAXIMUM volume + gain
        this.audioTracks = [
            document.getElementById('backgroundAudio1'),
            document.getElementById('backgroundAudio2')
        ];

        // Wait for audio to load with maximum volume
        await Promise.all(this.audioTracks.map(audio => {
            return new Promise((resolve) => {
                if (audio) {
                    audio.volume = 1.0; // Maximum volume (100%)
                    // Try to boost audio further with gain if supported
                    if (window.AudioContext || window.webkitAudioContext) {
                        try {
                            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                            const source = audioContext.createMediaElementSource(audio);
                            const gainNode = audioContext.createGain();
                            gainNode.gain.value = 2.0; // Double the gain!
                            source.connect(gainNode);
                            gainNode.connect(audioContext.destination);
                        } catch (e) {
                            console.log('Audio gain boost not supported:', e);
                        }
                    }
                    audio.addEventListener('canplaythrough', resolve, { once: true });
                    audio.addEventListener('ended', () => this.playNextTrack());
                    audio.load();
                } else {
                    resolve();
                }
            });
        }));

        console.log('🎵 Audio tracks loaded at MAXIMUM volume with BOOST!');
    }

    setupEventListeners() {
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.addEventListener('click', () => this.connectWallet());

        const audioBtn = document.getElementById('audioToggle');
        audioBtn.addEventListener('click', () => this.toggleAudio());

        // Download button for Blackpaper - Enhanced setup
        const downloadBtn = document.getElementById('downloadBlackpaper');
        console.log('🔍 Download button element:', downloadBtn); // Debug log
        
        if (downloadBtn) {
            console.log('✅ Download button found! Setting up event listener...');
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📄 Download button clicked!');
                this.downloadBlackpaper();
            });
            
            // Force visibility
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.visibility = 'visible';
            downloadBtn.style.opacity = '1';
            
            console.log('🚀 Download button fully initialized!');
        } else {
            console.error('❌ Download button not found! Creating fallback...');
            this.createDownloadButtonFallback();
        }

        // Set initial audio button state
        audioBtn.textContent = '🔊 SOUND ON';
        audioBtn.classList.remove('muted');

        // Memecoin filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderMemecoinTable();
            });
        });

        // Force audio to start on any user interaction (browser requirement fallback)
        document.addEventListener('click', () => {
            if (this.audioEnabled && this.audioTracks[this.currentAudioIndex]) {
                const currentAudio = this.audioTracks[this.currentAudioIndex];
                if (currentAudio.paused) {
                    this.playCurrentTrack();
                }
            }
        }, { once: true });
    }

    createDownloadButtonFallback() {
        // Create download button if it doesn't exist
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const downloadBtn = document.createElement('button');
            downloadBtn.id = 'downloadBlackpaper';
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = '📄 BLACKPAPER';
            downloadBtn.style.display = 'inline-block';
            downloadBtn.style.visibility = 'visible';
            downloadBtn.style.opacity = '1';
            
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📄 Fallback download button clicked!');
                this.downloadBlackpaper();
            });
            
            headerActions.appendChild(downloadBtn);
            console.log('✅ Fallback download button created and added!');
        }
    }

    downloadBlackpaper() {
        console.log('🚀 Starting blackpaper download process...');
        
        try {

            // Direct download of the actual Blackpaper.pdf file
            const link = document.createElement('a');
            link.href = './src/assets/Blackpaper.pdf';
            link.download = 'Solana_Moon_Blackpaper.pdf';
            link.style.display = 'none';
            
            // Add to DOM, click, and remove
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Show success message
            this.showSuccessMessage('🚀 BLACKPAPER DOWNLOADED! READ THE SACRED TEXTS! 📄');
            
            console.log('✅ Blackpaper.pdf download completed successfully!');
            
        } catch (directError) {
            console.error('Direct download failed:', directError);
            
            // Fallback 1: Try with different path variations
            const alternatePaths = [
                'src/assets/Blackpaper.pdf',
                './assets/Blackpaper.pdf',
                '../assets/Blackpaper.pdf',
                '/src/assets/Blackpaper.pdf'
            ];
            
            let downloadAttempted = false;
            
            for (const path of alternatePaths) {
                try {
                    const link = document.createElement('a');
                    link.href = path;
                    link.download = 'Solana_Moon_Blackpaper.pdf';
                    link.style.display = 'none';
                    
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    console.log(`📄 Alternative download attempted with path: ${path}`);
                    downloadAttempted = true;
                    break;
                } catch (error) {
                    console.log(`Failed with path ${path}:`, error);
                    continue;
                }
            }
            
            if (downloadAttempted) {
                this.showSuccessMessage('📄 BLACKPAPER DOWNLOAD INITIATED! 🚀');
            } else {
                // Final fallback: open in new tab to view the PDF
                try {
                    window.open('./src/assets/Blackpaper.pdf', '_blank');
                    this.showSuccessMessage('📄 BLACKPAPER OPENED IN NEW TAB! 🚀');
                    console.log('📄 Blackpaper opened in new tab as fallback!');
                    
                } catch (finalError) {
                    console.error('All download methods failed:', finalError);
                    
                    // Show helpful error message
                    alert(`❌ Unable to download Blackpaper.pdf. 
                    
Please check that the file exists at:
📁 src/assets/Blackpaper.pdf

Or try right-clicking the button and selecting "Save link as..." 📄✨`);
                }
            }
        }
    }

    async connectWallet() {
        try {
            if (window.solana && window.solana.isPhantom) {
                const response = await window.solana.connect();
                this.wallet = response.publicKey.toString();
                
                document.getElementById('connectWallet').classList.add('hidden');
                document.getElementById('walletInfo').classList.remove('hidden');
                document.getElementById('walletAddress').textContent = 
                    `${this.wallet.slice(0, 4)}...${this.wallet.slice(-4)}`;
                
                await this.loadWalletBalance();
                this.showSuccessMessage('🚀 WALLET CONNECTED! TO THE MOON! 🌙');
            } else {
                alert('💎 Please install Phantom Wallet to connect! 💎');
            }
        } catch (error) {
            console.error('Wallet connection failed:', error);
            alert('❌ Connection failed. Try again, diamond hands! 💎🙌');
        }
    }

    async loadWalletBalance() {
        try {
            // Simulate SOL balance (replace with actual Solana RPC call)
            const mockBalance = (Math.random() * 100).toFixed(2);
            document.getElementById('solBalance').textContent = `${mockBalance} SOL`;
        } catch (error) {
            console.error('Failed to load balance:', error);
        }
    }

    async loadSolanaData() {
        try {
            await Promise.all([
                this.updatePrice(),
                this.updateNetworkStats()
            ]);
        } catch (error) {
            console.error('Failed to load Solana data:', error);
            this.showError('Failed to load Solana data');
        }
    }

    async updatePrice() {
        try {
            // Use ONLY CoinGecko API with comprehensive data
            const [priceResponse, historyResponse, coinDetailsResponse] = await Promise.all([
                fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&include_last_updated_at=true'),
                fetch('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=7&interval=daily'),
                fetch('https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&community_data=true&developer_data=true&sparkline=false')
            ]);

            const [priceData, historyData, coinDetails] = await Promise.all([
                priceResponse.json(),
                historyResponse.json(),
                coinDetailsResponse.json()
            ]);

            // Update basic price info
            if (priceData.solana) {
                const solData = priceData.solana;
                document.getElementById('solPrice').textContent = `$${solData.usd.toFixed(2)}`;
                
                const changeElement = document.getElementById('priceChange');
                const change24h = solData.usd_24h_change || 0;
                changeElement.textContent = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
                changeElement.style.color = change24h > 0 ? '#00ff88' : '#ff4444';
                
                // Update additional stats if elements exist
                this.updateAdditionalStats(solData, coinDetails);
            }

            // Process 7-day historical data
            if (historyData.prices && historyData.prices.length > 0) {
                this.priceHistory = historyData.prices.map(price => price[1]);
                this.volumeHistory = historyData.total_volumes ? historyData.total_volumes.map(vol => vol[1]) : [];
                this.marketCapHistory = historyData.market_caps ? historyData.market_caps.map(cap => cap[1]) : [];
                this.updatePriceChart();
            }

            // Process ATH/ATL data
            if (coinDetails.market_data) {
                this.athData = {
                    price: coinDetails.market_data.ath?.usd,
                    date: coinDetails.market_data.ath_date?.usd
                };
                this.atlData = {
                    price: coinDetails.market_data.atl?.usd,
                    date: coinDetails.market_data.atl_date?.usd
                };
                this.updateAthAtlDisplay();
            }

            // Display detailed Solana information
            this.displaySolanaDetails(coinDetails, priceData.solana);

        } catch (error) {
            console.error('Failed to update price, falling back to enhanced mock data:', error);
            this.generateEnhancedMockData();
        }
    }

    updateAdditionalStats(solData, coinDetails) {
        // Update market cap
        if (document.getElementById('marketCap')) {
            document.getElementById('marketCap').textContent = `$${this.formatLargeNumber(solData.usd_market_cap)}`;
        }
        
        // Update 24h volume
        if (document.getElementById('volume24h')) {
            document.getElementById('volume24h').textContent = `$${this.formatLargeNumber(solData.usd_24h_vol)}`;
        }
        
        // Update circulating supply from coin details
        if (document.getElementById('circulatingSupply') && coinDetails.market_data) {
            const supply = coinDetails.market_data.circulating_supply;
            document.getElementById('circulatingSupply').textContent = `${this.formatLargeNumber(supply)} SOL`;
        }
        
        // Update max supply
        if (document.getElementById('maxSupply') && coinDetails.market_data) {
            const maxSupply = coinDetails.market_data.max_supply;
            document.getElementById('maxSupply').textContent = maxSupply ? `${this.formatLargeNumber(maxSupply)} SOL` : 'No Limit';
        }
    }

    displaySolanaDetails(coinDetails, priceData) {
        // Create or update Solana details section
        let detailsContainer = document.getElementById('solanaDetails');
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.id = 'solanaDetails';
            detailsContainer.className = 'solana-details';
            
            // Insert after stats grid
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                statsGrid.insertAdjacentElement('afterend', detailsContainer);
            }
        }

        const marketData = coinDetails.market_data || {};
        const communityData = coinDetails.community_data || {};
        
        detailsContainer.innerHTML = `
            <h3>🚀 DETAILED SOLANA INFORMATION 🚀</h3>
            <div class="solana-info-grid">
                <div class="info-item">
                    <div class="info-label">Market Cap Rank</div>
                    <div class="info-value">#${coinDetails.market_cap_rank || 'N/A'}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Supply</div>
                    <div class="info-value">${this.formatLargeNumber(marketData.total_supply)} SOL</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fully Diluted Valuation</div>
                    <div class="info-value">$${this.formatLargeNumber(marketData.fully_diluted_valuation)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 7d</div>
                    <div class="info-value" style="color: ${(marketData.price_change_percentage_7d || 0) > 0 ? '#00ff88' : '#ff4444'}">
                        ${(marketData.price_change_percentage_7d || 0).toFixed(2)}%
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 30d</div>
                    <div class="info-value" style="color: ${(marketData.price_change_percentage_30d || 0) > 0 ? '#00ff88' : '#ff4444'}">
                        ${(marketData.price_change_percentage_30d || 0).toFixed(2)}%
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 1y</div>
                    <div class="info-value" style="color: ${(marketData.price_change_percentage_1y || 0) > 0 ? '#00ff88' : '#ff4444'}">
                        ${(marketData.price_change_percentage_1y || 0).toFixed(2)}%
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">Twitter Followers</div>
                    <div class="info-value">${this.formatLargeNumber(communityData.twitter_followers)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reddit Subscribers</div>
                    <div class="info-value">${this.formatLargeNumber(communityData.reddit_subscribers)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Developer Score</div>
                    <div class="info-value">${(coinDetails.developer_score || 0).toFixed(1)}/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Community Score</div>
                    <div class="info-value">${(coinDetails.community_score || 0).toFixed(1)}/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Liquidity Score</div>
                    <div class="info-value">${(coinDetails.liquidity_score || 0).toFixed(1)}/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Public Interest</div>
                    <div class="info-value">${(coinDetails.public_interest_score || 0).toFixed(1)}/100</div>
                </div>
            </div>
        `;
    }

    formatLargeNumber(num) {
        if (!num) return 'N/A';
        if (num >= 1000000000000) {
            return (num / 1000000000000).toFixed(2) + 'T';
        } else if (num >= 1000000000) {
            return (num / 1000000000).toFixed(2) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    async updateNetworkStats() {
        try {
            // Use only realistic mock network statistics
            const mockTps = Math.floor(Math.random() * 3000 + 2000); // 2000-5000 TPS
            const mockValidators = Math.floor(Math.random() * 200 + 1700); // 1700-1900 validators
            const mockEpoch = Math.floor(Math.random() * 20 + 580); // Current epoch range
            
            if (document.getElementById('networkTps')) {
                document.getElementById('networkTps').textContent = mockTps.toLocaleString();
            }
            if (document.getElementById('validators')) {
                document.getElementById('validators').textContent = mockValidators.toLocaleString();
            }
            if (document.getElementById('currentEpoch')) {
                document.getElementById('currentEpoch').textContent = mockEpoch;
            }
            
            console.log('🚀 Network stats updated with realistic data');
            
        } catch (error) {
            console.error('Failed to update network stats:', error);
            // Fallback values
            if (document.getElementById('networkTps')) {
                document.getElementById('networkTps').textContent = '3,247';
            }
            if (document.getElementById('validators')) {
                document.getElementById('validators').textContent = '1,823';
            }
            if (document.getElementById('currentEpoch')) {
                document.getElementById('currentEpoch').textContent = '592';
            }
        }
    }

    async fetchTrendingMemecoins() {
        try {
            // Use CoinGecko trending API with better error handling
            const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.coins) {
                return data.coins.slice(0, 5).map(item => {
                    const coin = item.item;
                    return {
                        symbol: coin.symbol.toUpperCase(),
                        name: coin.name,
                        price: Math.random() * 0.1,
                        change24h: Math.random() * 500 - 50,
                        marketCap: Math.random() * 10000000,
                        volume: Math.random() * 5000000,
                        platform: 'trending',
                        launched: new Date(Date.now() - Math.random() * 86400000 * 7),
                        rank: coin.market_cap_rank || 999
                    };
                });
            }
        } catch (error) {
            console.error('Trending API error, using mock trending data:', error);
            
            // Enhanced mock trending data
            const mockTrendingNames = [
                'VIRAL MEME MACHINE', 'TRENDING BEAST MODE', 'SOCIAL MEDIA KING',
                'INFLUENCER TOKEN', 'HYPE TRAIN EXPRESS'
            ];
            
            return mockTrendingNames.map((name, i) => ({
                symbol: this.generateMemeTicker(),
                name: name,
                price: Math.random() * 0.05,
                change24h: Math.random() * 300 - 25,
                marketCap: Math.random() * 15000000,
                volume: Math.random() * 8000000,
                platform: 'trending',
                launched: new Date(Date.now() - Math.random() * 86400000 * 2),
                rank: 500 + i
            }));
        }
        return [];
    }

    async loadMemecoinData() {
        try {
            this.showLoading();
            
            // Combine data from multiple sources
            const [pumpfunData, raydiumData] = await Promise.all([
                this.fetchPumpfunData(),
                this.fetchRaydiumData()
            ]);

            this.memecoins = [...pumpfunData, ...raydiumData];
            this.renderMemecoinTable();
            
        } catch (error) {
            console.error('Failed to load memecoin data:', error);
            this.showError('Failed to load memecoin data');
            // Fallback to mock data
            this.loadMockMemecoinData();
        }
    }

    async fetchPumpfunData() {
        try {
            // Enhanced mock data with EPIC meme names
            const epicMemeNames = [
                'PEPE PRESIDENT 2024', 'MOON LAMBO ROCKET', 'DIAMOND HANDS FOREVER', 
                'HODL TILL VALHALLA', 'DOGE TO ANDROMEDA', 'WEN MOON CAPTAIN',
                'CHAD THUNDER BULL', 'GIGACHAD TOKEN', 'BASED APE SOCIETY',
                'SIGMA GRINDSET COIN', 'TENDIES INCOMING', 'PUMP MY BAGS',
                'REKT RECOVERY FUND', 'FOMO KING SUPREME', 'YOLO SWAG MONEY',
                'NUMBER GO UP ONLY', 'LINE GOES BRRRRR', 'MONEY PRINTER GO',
                'STONKS TO JUPITER', 'GAINS GOBLIN GANG'
            ];
            
            const pumpfunCoins = [];
            
            for (let i = 0; i < 12; i++) {
                pumpfunCoins.push({
                    symbol: this.generateMemeTicker(),
                    name: epicMemeNames[i] || `Epic Meme ${i + 1}`,
                    price: Math.random() * 0.05,
                    change24h: Math.random() * 800 - 100, // More extreme gains/losses
                    marketCap: Math.random() * 100000000,
                    volume: Math.random() * 25000000,
                    platform: 'pumpfun',
                    launched: new Date(Date.now() - Math.random() * 86400000 * 3)
                });
            }
            
            return pumpfunCoins;
        } catch (error) {
            console.error('Pumpfun API error:', error);
            return [];
        }
    }

    async fetchRaydiumData() {
        try {
            // Try real Raydium API first
            const response = await fetch('https://api.raydium.io/v2/main/pairs');
            const data = await response.json();
            
            if (data && Array.isArray(data)) {
                const recent = data
                    .filter(pair => {
                        const created = new Date(pair.createTime);
                        const now = new Date();
                        return (now - created) < 259200000; // 3 days
                    })
                    .slice(0, 8)
                    .map(pair => ({
                        symbol: pair.baseSymbol || this.generateMemeTicker(),
                        name: pair.baseName || this.generateEpicName(),
                        price: parseFloat(pair.price) || Math.random() * 0.2,
                        change24h: parseFloat(pair.change24h) || (Math.random() * 400 - 75),
                        marketCap: parseFloat(pair.marketCap) || Math.random() * 50000000,
                        volume: parseFloat(pair.volume24h) || Math.random() * 15000000,
                        platform: 'raydium',
                        launched: new Date(pair.createTime || Date.now() - Math.random() * 259200000)
                    }));
                
                return recent;
            }
        } catch (error) {
            console.error('Raydium API error:', error);
        }
        
        // Enhanced fallback with EPIC Raydium names
        const epicRaydiumNames = [
            'SOLANA SPEED DEMON', 'DEX MASTER CHIEF', 'LIQUIDITY LEGEND',
            'SWAP KING KONG', 'AMM ATOMIC BOMB', 'YIELD FARMER PRO',
            'FLASH LOAN FLASH', 'ARBITRAGE ALPHA', 'WHALE HUNTER X',
            'SLIPPAGE SLAYER', 'GAS FEE GOBLIN', 'MEV BOT KILLER'
        ];
        
        const raydiumCoins = [];
        
        for (let i = 0; i < 10; i++) {
            raydiumCoins.push({
                symbol: this.generateMemeTicker(),
                name: epicRaydiumNames[i] || `Raydium Beast ${i + 1}`,
                price: Math.random() * 1.0,
                change24h: Math.random() * 600 - 150,
                marketCap: Math.random() * 200000000,
                volume: Math.random() * 50000000,
                platform: 'raydium',
                launched: new Date(Date.now() - Math.random() * 259200000)
            });
        }
        
        return raydiumCoins;
    }

    generateMemeTicker() {
        const prefixes = ['MOON', 'PEPE', 'DOGE', 'CHAD', 'BASED', 'SIGMA', 'ALPHA', 'BULL', 'BEAR', 'APE'];
        const suffixes = ['X', 'INU', 'COIN', 'TOKEN', '2024', '100X', 'MOON', 'MARS', 'PLUTO', 'GALAXY'];
        
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const number = Math.floor(Math.random() * 999) + 1;
        
        return `${prefix}${number}${suffix}`;
    }

    generateEpicName() {
        const adjectives = ['LEGENDARY', 'EPIC', 'ULTIMATE', 'SUPREME', 'MEGA', 'ULTRA', 'SUPER', 'HYPER'];
        const nouns = ['MOONSHOT', 'ROCKET', 'DIAMOND', 'GOLDEN', 'PLATINUM', 'COSMIC', 'GALACTIC', 'QUANTUM'];
        const endings = ['PROTOCOL', 'NETWORK', 'ECOSYSTEM', 'FINANCE', 'DEFI', 'TOKEN', 'COIN', 'PROJECT'];
        
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];
        const ending = endings[Math.floor(Math.random() * endings.length)];
        
        return `${adj} ${noun} ${ending}`;
    }

    generateEnhancedMockData() {
        // Generate realistic 7-day mock data based on actual market conditions
        const basePrice = 180 + (Math.random() - 0.5) * 40; // $160-$200 range
        const baseMktCap = 85000000000; // ~85B market cap
        const baseVolume = 3500000000; // ~3.5B daily volume
        
        this.priceHistory = [];
        this.volumeHistory = [];
        this.marketCapHistory = [];
        
        for (let i = 0; i < 7; i++) {
            // Price with realistic volatility
            const priceVariation = (Math.random() - 0.5) * 30;
            const dailyTrend = Math.sin((i / 7) * Math.PI * 2) * 15;
            const price = basePrice + priceVariation + dailyTrend;
            this.priceHistory.push(Math.max(price, 50)); // Don't go below $50
            
            // Volume with weekend patterns (lower on weekends)
            const isWeekend = i === 0 || i === 6;
            const volumeMultiplier = isWeekend ? 0.6 : 1.0;
            const volume = baseVolume * volumeMultiplier * (0.8 + Math.random() * 0.4);
            this.volumeHistory.push(volume);
            
            // Market cap correlates with price
            const marketCap = baseMktCap * (price / basePrice);
            this.marketCapHistory.push(marketCap);
        }
        
        // Set current price display
        const currentPrice = this.priceHistory[this.priceHistory.length - 1];
        document.getElementById('solPrice').textContent = `$${currentPrice.toFixed(2)}`;
        
        // Calculate 24h change
        const change24h = this.priceHistory.length > 1 ? 
            ((currentPrice - this.priceHistory[this.priceHistory.length - 2]) / this.priceHistory[this.priceHistory.length - 2]) * 100 : 0;
        
        const changeElement = document.getElementById('priceChange');
        changeElement.textContent = `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%`;
        changeElement.style.color = change24h > 0 ? '#00ff88' : '#ff4444';
        
        // Mock ATH/ATL data
        this.athData = {
            price: 260.06,
            date: '2021-11-06T16:32:41.845Z'
        };
        this.atlData = {
            price: 0.500801,
            date: '2020-05-11T19:35:23.449Z'
        };
        
        // Mock detailed Solana info
        this.displayMockSolanaDetails();
        this.updatePriceChart();
        this.updateAthAtlDisplay();
    }

    displayMockSolanaDetails() {
        let detailsContainer = document.getElementById('solanaDetails');
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.id = 'solanaDetails';
            detailsContainer.className = 'solana-details';
            
            const statsGrid = document.querySelector('.stats-grid');
            if (statsGrid) {
                statsGrid.insertAdjacentElement('afterend', detailsContainer);
            }
        }

        detailsContainer.innerHTML = `
            <h3>🚀 DETAILED SOLANA INFORMATION (MOCK DATA) 🚀</h3>
            <div class="solana-info-grid">
                <div class="info-item">
                    <div class="info-label">Market Cap Rank</div>
                    <div class="info-value">#5</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Total Supply</div>
                    <div class="info-value">588.6M SOL</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Fully Diluted Valuation</div>
                    <div class="info-value">$105.7B</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 7d</div>
                    <div class="info-value" style="color: #00ff88">+12.5%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 30d</div>
                    <div class="info-value" style="color: #00ff88">+28.7%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Price Change 1y</div>
                    <div class="info-value" style="color: #00ff88">+156.8%</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Twitter Followers</div>
                    <div class="info-value">3.2M</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Reddit Subscribers</div>
                    <div class="info-value">425K</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Developer Score</div>
                    <div class="info-value">85.2/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Community Score</div>
                    <div class="info-value">78.9/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Liquidity Score</div>
                    <div class="info-value">92.1/100</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Public Interest</div>
                    <div class="info-value">88.5/100</div>
                </div>
            </div>
        `;
    }

    updateAthAtlDisplay() {
        // Create or update ATH/ATL display
        let athAtlContainer = document.getElementById('athAtlContainer');
        if (!athAtlContainer) {
            athAtlContainer = document.createElement('div');
            athAtlContainer.id = 'athAtlContainer';
            athAtlContainer.className = 'ath-atl-container';
            
            // Insert after Solana details
            const solanaDetails = document.getElementById('solanaDetails');
            if (solanaDetails) {
                solanaDetails.appendChild(athAtlContainer);
            }
        }

        athAtlContainer.innerHTML = `
            <div class="ath-card">
                <div class="ath-label">🚀 ALL-TIME HIGH</div>
                <div class="ath-price">$${this.athData?.price?.toFixed(2) || '---'}</div>
                <div class="ath-date">${this.athData?.date ? new Date(this.athData.date).toLocaleDateString() : 'Unknown'}</div>
            </div>
            <div class="atl-card">
                <div class="atl-label">📉 ALL-TIME LOW</div>
                <div class="atl-price">$${this.atlData?.price?.toFixed(6) || '---'}</div>
                <div class="atl-date">${this.atlData?.date ? new Date(this.atlData.date).toLocaleDateString() : 'Unknown'}</div>
            </div>
        `;
    }

    loadMockMemecoinData() {
        // Fallback mock data when API calls fail
        const mockCoins = [
            {
                symbol: 'MOONPEPE',
                name: 'MOON PEPE ROCKET',
                price: 0.00234,
                change24h: 247.5,
                marketCap: 12500000,
                volume: 3400000,
                platform: 'pumpfun',
                launched: new Date(Date.now() - 86400000)
            },
            {
                symbol: 'SOLBEAST',
                name: 'SOLANA BEAST MODE',
                price: 0.156,
                change24h: -12.3,
                marketCap: 45000000,
                volume: 8900000,
                platform: 'raydium',
                launched: new Date(Date.now() - 172800000)
            },
            {
                symbol: 'DIAMONDX',
                name: 'DIAMOND HANDS X',
                price: 0.00089,
                change24h: 89.7,
                marketCap: 8700000,
                volume: 2100000,
                platform: 'trending',
                launched: new Date(Date.now() - 259200000)
            }
        ];

        this.memecoins = mockCoins;
        this.renderMemecoinTable();
    }

    updatePriceChart() {
        if (this.priceChart && this.priceHistory.length > 0) {
            // Create labels for 3 days (72 hours)
            const labels = this.priceHistory.map((_, i) => {
                const hoursAgo = this.priceHistory.length - 1 - i;
                if (hoursAgo === 0) return 'Now';
                if (hoursAgo < 24) return `${hoursAgo}h ago`;
                const daysAgo = Math.floor(hoursAgo / 24);
                const remainingHours = hoursAgo % 24;
                return `${daysAgo}d ${remainingHours}h ago`;
            }).reverse();
            
            this.priceChart.data.datasets[0].data = this.priceHistory;
            this.priceChart.data.labels = labels;
            this.priceChart.update('none');
        }
    }

    showLoading() {
        const tbody = document.getElementById('memecoinTableBody');
        tbody.innerHTML = '<tr><td colspan="8" class="loading">🚀 Loading fresh memecoins... TO THE MOON! 🌙</td></tr>';
    }

    showError(message) {
        const tbody = document.getElementById('memecoinTableBody');
        tbody.innerHTML = `<tr><td colspan="8" class="error">❌ ${message}</td></tr>`;
    }

    setupCharts() {
        this.setupPriceChart();
        this.setupActivityChart();
    }

    setupPriceChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        this.priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'SOL Price (USD) - Last 3 Days',
                    data: [],
                    borderColor: '#00ff88',
                    backgroundColor: 'rgba(0, 255, 136, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#00ff88',
                        bodyColor: '#fff',
                        borderColor: '#00ff88',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: { 
                            color: '#00ff88', 
                            font: { size: 10 },
                            maxTicksLimit: 8,
                            maxRotation: 0
                        },
                        grid: { 
                            color: 'rgba(0, 255, 136, 0.2)',
                            display: true
                        }
                    },
                    y: {
                        display: true,
                        ticks: { 
                            color: '#00ff88', 
                            font: { size: 10 },
                            callback: function(value) {
                                return '$' + value.toFixed(0);
                            }
                        },
                        grid: { 
                            color: 'rgba(0, 255, 136, 0.2)',
                            display: true
                        }
                    }
                }
            }
        });
    }

    setupActivityChart() {
        const ctx = document.getElementById('activityChart').getContext('2d');
        const mockActivityData = Array.from({length: 12}, () => Math.random() * 5000 + 1000);
        
        this.activityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({length: 12}, (_, i) => `${i * 2}:00`),
                datasets: [{
                    label: 'TPS',
                    data: mockActivityData,
                    backgroundColor: 'rgba(255, 0, 255, 0.6)',
                    borderColor: '#ff00ff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        top: 10,
                        right: 10,
                        bottom: 10,
                        left: 10
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ff00ff',
                        bodyColor: '#fff',
                        borderColor: '#ff00ff',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        ticks: { 
                            color: '#ff00ff', 
                            font: { size: 10 },
                            maxRotation: 0
                        },
                        grid: { 
                            color: 'rgba(255, 0, 255, 0.2)',
                            display: true
                        }
                    },
                    y: {
                        display: true,
                        ticks: { 
                            color: '#ff00ff', 
                            font: { size: 10 },
                            callback: function(value) {
                                return value.toFixed(0);
                            }
                        },
                        grid: { 
                            color: 'rgba(255, 0, 255, 0.2)',
                            display: true
                        }
                    }
                }
            }
        });
    }

    renderMemecoinTable() {
        const tbody = document.getElementById('memecoinTableBody');
        let filteredCoins = this.memecoins;

        if (this.currentFilter !== 'all') {
            filteredCoins = this.memecoins.filter(coin => coin.platform === this.currentFilter);
        }

        tbody.innerHTML = filteredCoins.map(coin => `
            <tr>
                <td>
                    <div class="token-info">
                        <div class="token-logo">${coin.symbol.charAt(0)}</div>
                        <span>${coin.symbol}</span>
                    </div>
                </td>
                <td>${coin.name}</td>
                <td>$${coin.price.toFixed(6)}</td>
                <td class="${coin.change24h > 0 ? 'price-positive' : 'price-negative'}">
                    ${coin.change24h > 0 ? '+' : ''}${coin.change24h.toFixed(1)}%
                </td>
                <td>$${this.formatNumber(coin.marketCap)}</td>
                <td>$${this.formatNumber(coin.volume)}</td>
                <td>
                    <span class="platform-badge platform-${coin.platform}">
                        ${coin.platform.toUpperCase()}
                    </span>
                </td>
                <td>
                    <button class="moon-btn" onclick="alert('🚀 TO THE MOON! 🌙')">
                        🚀 MOON
                    </button>
                </td>
            </tr>
        `).join('');
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    startDataRefresh() {
        // Refresh price more frequently
        setInterval(() => {
            this.updatePrice();
        }, 60000); // Every minute

        // Refresh network stats
        setInterval(() => {
            this.updateNetworkStats();
        }, 120000); // Every 2 minutes

        // Refresh memecoin data
        setInterval(() => {
            this.loadMemecoinData();
        }, 300000); // Every 5 minutes
    }

    showMemeMessages() {
        const messages = [
            '🚀 SOLANA TO THE MOON! 🌙',
            '💎 DIAMOND HANDS ACTIVATED! 💎',
            '⚡ LIGHTNING FAST TRANSACTIONS! ⚡',
            '🔥 THIS IS THE WAY! 🔥',
            '🎵 VIBING TO THE BEAT! 🎵'
        ];

        let messageIndex = 0;
        setInterval(() => {
            console.log(messages[messageIndex]);
            messageIndex = (messageIndex + 1) % messages.length;
        }, 5000);
    }

    toggleAudio() {
        const audioBtn = document.getElementById('audioToggle');
        
        if (this.audioEnabled) {
            this.disableAudio();
            audioBtn.textContent = '🔇 SOUND OFF';
            audioBtn.classList.add('muted');
        } else {
            this.enableAudio();
            audioBtn.textContent = '🔊 SOUND ON';
            audioBtn.classList.remove('muted');
        }
    }

    enableAudio() {
        this.audioEnabled = true;
        // Try to play immediately
        setTimeout(() => {
            this.playCurrentTrack();
        }, 100); // Very short delay to ensure setup is complete
        console.log('🚀 AUDIO TO THE MOON AT MAXIMUM VOLUME! 🎵');
    }

    disableAudio() {
        this.audioEnabled = false;
        this.audioTracks.forEach(audio => {
            if (audio) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
    }

    playCurrentTrack() {
        if (!this.audioEnabled || !this.audioTracks[this.currentAudioIndex]) return;

        const currentAudio = this.audioTracks[this.currentAudioIndex];
        // MAXIMUM volume enforcement
        currentAudio.volume = 1.0;
        
        currentAudio.play().then(() => {
            console.log(`🎵 Playing track ${this.currentAudioIndex + 1} at MAXIMUM VOLUME WITH BOOST!`);
        }).catch(error => {
            console.log('Audio play failed, will retry on user interaction:', error);
        });
    }

    playNextTrack() {
        if (!this.audioEnabled) return;

        this.currentAudioIndex = (this.currentAudioIndex + 1) % this.audioTracks.length;
        console.log(`🎵 Switching to track ${this.currentAudioIndex + 1}`);
        setTimeout(() => {
            this.playCurrentTrack();
        }, 500); // Shorter gap between tracks
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 255, 136, 0.9);
            color: #000;
            padding: 2rem;
            border-radius: 10px;
            font-family: Orbitron;
            font-weight: 900;
            font-size: 1.5rem;
            z-index: 1000;
            animation: pulse 1s infinite;
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);

        setTimeout(() => {
            document.body.removeChild(successDiv);
        }, 3000);
    }
}

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SolanaMoonDashboard();
});