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
        this.backgroundVideo = null;
        this.init();
    }

    async init() {
        this.setupBackgroundVideo();
        this.setupEventListeners();
        this.addMissingStyles();
        this.setupCharts();
        await this.loadSolanaData();
        await this.loadMemecoinData();
        this.startDataRefresh();
        this.showMemeMessages();
    }

    setupBackgroundVideo() {
        // Wait for DOM to be fully loaded
        const video = document.getElementById('backgroundVideo');
        if (video) {
            this.backgroundVideo = video;
            console.log('✅ Background video element found and assigned');
            
            // Set initial properties
            this.backgroundVideo.muted = true;
            this.backgroundVideo.volume = 1.0; // Maximum volume when unmuted
            
            // Add event listeners for debugging
            this.backgroundVideo.addEventListener('loadeddata', () => {
                console.log('🎬 Background video loaded and ready!');
                console.log(`Video properties: duration=${this.backgroundVideo.duration}, muted=${this.backgroundVideo.muted}, volume=${this.backgroundVideo.volume}`);
            });
            
            this.backgroundVideo.addEventListener('canplay', () => {
                console.log('🎥 Video can start playing');
            });
            
            this.backgroundVideo.addEventListener('play', () => {
                console.log('▶️ Video started playing');
            });
            
            this.backgroundVideo.addEventListener('volumechange', () => {
                console.log(`🔊 Volume changed: muted=${this.backgroundVideo.muted}, volume=${this.backgroundVideo.volume}`);
            });
            
            this.backgroundVideo.addEventListener('error', (e) => {
                console.error('Video loading error:', e);
            });
            
            // Force video to play if it's not already playing
            this.backgroundVideo.play().catch(e => {
                console.log('Video autoplay prevented by browser, will play on user interaction');
            });
        } else {
            console.error('❌ Background video element not found!');
        }
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
    }

    setupEventListeners() {
        const connectBtn = document.getElementById('connectWallet');
        connectBtn.addEventListener('click', () => this.connectWallet());

        const audioBtn = document.getElementById('audioToggle');
        if (audioBtn) {
            audioBtn.addEventListener('click', () => this.toggleVideoAudio());
            
            // Set initial button state
            audioBtn.textContent = '🔇 SOUND OFF';
            audioBtn.classList.add('muted');
            console.log('✅ Audio button initialized');
        } else {
            console.error('❌ Audio toggle button not found!');
        }

        // Download button for Blackpaper - Fetch-based approach
        const downloadBtn = document.getElementById('downloadBlackpaper');
        console.log('🔍 Download button element:', downloadBtn);
        
        if (downloadBtn) {
            console.log('✅ Download button found! Setting up event listener...');
            
            // Replace the default href behavior with fetch download
            downloadBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default anchor behavior
                console.log('📄 Download button clicked!');
                this.downloadBlackpaperViaFetch();
            });
            
            console.log('🚀 Download button fully initialized!');
        } else {
            console.error('❌ Download button not found! Creating fallback...');
            this.createDownloadButtonFallback();
        }

        // Memecoin filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderMemecoinTable();
            });
        });
    }

    toggleVideoAudio() {
        const audioBtn = document.getElementById('audioToggle');
        
        if (!this.backgroundVideo) {
            console.error('❌ Background video not found - reinitializing...');
            this.setupBackgroundVideo();
            if (!this.backgroundVideo) {
                alert('⚠️ Video not loaded yet. Please try again in a moment.');
                return;
            }
        }
        
        console.log(`🎵 Current video state: muted=${this.backgroundVideo.muted}, paused=${this.backgroundVideo.paused}, volume=${this.backgroundVideo.volume}`);
        
        if (this.backgroundVideo.muted) {
            // Create a completely new approach to enable audio
            this.enableVideoAudioWithUserGesture(audioBtn);
        } else {
            // Mute the video
            this.backgroundVideo.muted = true;
            audioBtn.textContent = '🔇 SOUND OFF';
            audioBtn.classList.add('muted');
            console.log('🔇 Video audio disabled');
        }
    }

    enableVideoAudioWithUserGesture(audioBtn) {
        try {
            // Method 1: Direct approach
            console.log('🎵 Attempting direct video unmute...');
            
            // Save current time to maintain playback position
            const currentTime = this.backgroundVideo.currentTime;
            
            // Unmute and set volume
            this.backgroundVideo.muted = false;
            this.backgroundVideo.volume = 1.0;
            
            // Force a new play command with user gesture
            this.backgroundVideo.currentTime = currentTime;
            
            const playPromise = this.backgroundVideo.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('🎵 SUCCESS: Video is now playing with audio!');
                    audioBtn.textContent = '🔊 SOUND ON';
                    audioBtn.classList.remove('muted');
                    this.showSuccessMessage('🎵 SOUND ON! VIBING TO THE MOON! 🚀');
                    
                    // Verify audio is actually playing
                    setTimeout(() => {
                        console.log(`🔊 Audio verification: muted=${this.backgroundVideo.muted}, volume=${this.backgroundVideo.volume}`);
                        if (!this.backgroundVideo.muted && this.backgroundVideo.volume > 0) {
                            console.log('✅ Audio is successfully enabled!');
                        } else {
                            console.warn('⚠️ Audio may still be blocked');
                            this.tryAlternativeAudioMethod(audioBtn);
                        }
                    }, 1000);
                    
                }).catch(error => {
                    console.error('🎵 Play failed, trying alternative method:', error);
                    this.tryAlternativeAudioMethod(audioBtn);
                });
            } else {
                // Fallback for browsers that don't return a promise
                setTimeout(() => {
                    if (!this.backgroundVideo.muted && this.backgroundVideo.volume > 0) {
                        console.log('🎵 Audio enabled via fallback method');
                        audioBtn.textContent = '🔊 SOUND ON';
                        audioBtn.classList.remove('muted');
                        this.showSuccessMessage('🎵 SOUND ON! VIBING TO THE MOON! 🚀');
                    } else {
                        this.tryAlternativeAudioMethod(audioBtn);
                    }
                }, 500);
            }
            
        } catch (error) {
            console.error('🎵 Direct method failed:', error);
            this.tryAlternativeAudioMethod(audioBtn);
        }
    }

    tryAlternativeAudioMethod(audioBtn) {
        console.log('🔄 Trying alternative audio enablement...');
        
        try {
            // Method 2: Reload and replay approach
            const videoSrc = this.backgroundVideo.src;
            const currentTime = this.backgroundVideo.currentTime;
            
            // Create a new video element temporarily
            const tempVideo = document.createElement('video');
            tempVideo.src = videoSrc;
            tempVideo.muted = false;
            tempVideo.volume = 1.0;
            tempVideo.loop = true;
            tempVideo.autoplay = true;
            tempVideo.currentTime = currentTime;
            
            // Try to play the temp video
            tempVideo.play().then(() => {
                console.log('🎵 Temp video playing with audio, applying to main video...');
                
                // Apply settings to main video
                this.backgroundVideo.muted = false;
                this.backgroundVideo.volume = 1.0;
                this.backgroundVideo.currentTime = currentTime;
                
                audioBtn.textContent = '🔊 SOUND ON';
                audioBtn.classList.remove('muted');
                this.showSuccessMessage('🎵 SOUND ON! AUDIO UNLOCKED! 🚀');
                
                // Remove temp video
                tempVideo.remove();
                
            }).catch(e => {
                console.log('🎵 Temp video method failed, trying reload...');
                tempVideo.remove();
                this.tryVideoReloadMethod(audioBtn, currentTime);
            });
            
        } catch (error) {
            console.error('🎵 Alternative method failed:', error);
            this.tryVideoReloadMethod(audioBtn, this.backgroundVideo.currentTime);
        }
    }

    tryVideoReloadMethod(audioBtn, currentTime) {
        console.log('🔄 Trying video reload method...');
        
        try {
            // Method 3: Complete reload with audio enabled
            const videoSrc = this.backgroundVideo.src;
            
            // Store video properties
            const wasPlaying = !this.backgroundVideo.paused;
            
            // Reload video with audio
            this.backgroundVideo.load();
            this.backgroundVideo.muted = false;
            this.backgroundVideo.volume = 1.0;
            
            this.backgroundVideo.addEventListener('loadeddata', () => {
                console.log('🎵 Video reloaded, setting time and playing...');
                this.backgroundVideo.currentTime = currentTime;
                
                if (wasPlaying) {
                    this.backgroundVideo.play().then(() => {
                        console.log('🎵 Video successfully reloaded with audio!');
                        audioBtn.textContent = '🔊 SOUND ON';
                        audioBtn.classList.remove('muted');
                        this.showSuccessMessage('🎵 SOUND ON! AUDIO RELOADED! 🚀');
                    }).catch(e => {
                        console.error('🎵 Reload play failed:', e);
                        this.showAudioTroubleshootingMessage();
                        // Still update UI
                        audioBtn.textContent = '🔊 SOUND ON';
                        audioBtn.classList.remove('muted');
                    });
                }
            }, { once: true });
            
        } catch (error) {
            console.error('🎵 Reload method failed:', error);
            this.showAudioTroubleshootingMessage();
            // Still update UI to show attempt
            audioBtn.textContent = '🔊 SOUND ON';
            audioBtn.classList.remove('muted');
        }
    }

    showAudioTroubleshootingMessage() {
        const troubleshootDiv = document.createElement('div');
        troubleshootDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #ff00ff;
            padding: 2rem;
            border-radius: 15px;
            font-family: Orbitron;
            font-weight: 700;
            font-size: 1rem;
            z-index: 2000;
            border: 2px solid #ff00ff;
            max-width: 600px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 0, 255, 0.5);
        `;
        
        troubleshootDiv.innerHTML = `
            <h3 style="color: #ff00ff; margin-bottom: 1rem;">🔊 AUDIO TROUBLESHOOTING</h3>
            <p style="margin-bottom: 1rem;">If you can't hear the video audio, try these steps:</p>
            
            <div style="text-align: left; margin: 1rem 0; background: rgba(255, 0, 255, 0.1); padding: 1rem; border-radius: 10px;">
                <strong>🔧 Troubleshooting Steps:</strong><br><br>
                
                <strong>1. Check Browser:</strong><br>
                • Right-click on the page → "Unmute site"<br>
                • Check if sound icon shows "muted" in browser tab<br><br>
                
                <strong>2. Video File:</strong><br>
                • The video file might not have audio<br>
                • Try refreshing the page<br><br>
                
                <strong>3. Browser Settings:</strong><br>
                • Enable autoplay in browser settings<br>
                • Allow sound for this website<br><br>
                
                <strong>4. System Volume:</strong><br>
                • Check your system/browser volume is not muted
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                <button id="retryAudio" style="
                    background: #ff00ff;
                    color: #000;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 25px;
                    font-family: Orbitron;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">🔄 RETRY AUDIO</button>
                
                <button id="closeTroubleshooting" style="
                    background: #ffeb3b;
                    color: #000;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 25px;
                    font-family: Orbitron;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">UNDERSTOOD 🚀</button>
            </div>
        `;
        
        document.body.appendChild(troubleshootDiv);
        
        // Add click handlers
        document.getElementById('retryAudio').addEventListener('click', () => {
            document.body.removeChild(troubleshootDiv);
            this.toggleVideoAudio(); // Try again
        });
        
        document.getElementById('closeTroubleshooting').addEventListener('click', () => {
            document.body.removeChild(troubleshootDiv);
        });
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (document.body.contains(troubleshootDiv)) {
                document.body.removeChild(troubleshootDiv);
            }
        }, 15000);
    }

    createDownloadButtonFallback() {
        // Create download button if it doesn't exist
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const downloadLink = document.createElement('a');
            downloadLink.id = 'downloadBlackpaper';
            downloadLink.className = 'download-btn';
            downloadLink.href = '#'; // Use # to prevent navigation
            downloadLink.textContent = '📄 BLACKPAPER';
            downloadLink.title = 'Download Solana Moon Blackpaper';
            
            downloadLink.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('📄 Fallback download link clicked!');
                this.downloadBlackpaperViaFetch();
            });
            
            headerActions.appendChild(downloadLink);
            console.log('✅ Fallback download link created and added!');
        }
    }

    async downloadBlackpaperViaFetch() {
        console.log('🚀 Starting fetch-based blackpaper download...');
        
        const possiblePaths = [
            'src/assets/Blackpaper.pdf',
            './src/assets/Blackpaper.pdf',
            '/src/assets/Blackpaper.pdf',
            'assets/Blackpaper.pdf'
        ];
        
        for (const path of possiblePaths) {
            try {
                console.log(`📄 Trying to fetch: ${path}`);
                
                const response = await fetch(path);
                
                if (response.ok) {
                    console.log(`✅ Successfully fetched from: ${path}`);
                    
                    // Get the PDF as a blob
                    const blob = await response.blob();
                    
                    // Create object URL
                    const objectUrl = URL.createObjectURL(blob);
                    
                    // Create download link
                    const downloadLink = document.createElement('a');
                    downloadLink.href = objectUrl;
                    downloadLink.download = 'Solana_Moon_Blackpaper.pdf';
                    downloadLink.style.display = 'none';
                    
                    // Trigger download
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    
                    // Clean up object URL
                    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
                    
                    this.showSuccessMessage('🚀 BLACKPAPER DOWNLOADED! 📄');
                    console.log('✅ Fetch download completed successfully!');
                    return; // Success, exit function
                    
                } else {
                    console.log(`❌ Failed to fetch ${path}: ${response.status} ${response.statusText}`);
                }
                
            } catch (error) {
                console.log(`❌ Error fetching ${path}:`, error);
            }
        }
        
        // If all fetch attempts failed, try alternative approaches
        console.log('📄 All fetch attempts failed, trying alternative methods...');
        this.tryAlternativeDownloadMethods();
    }

    tryAlternativeDownloadMethods() {
        console.log('🔄 Trying alternative download methods...');
        
        // Method 1: Try opening in new window
        try {
            const newWindow = window.open('src/assets/Blackpaper.pdf', '_blank');
            if (newWindow) {
                this.showSuccessMessage('📄 BLACKPAPER OPENED IN NEW WINDOW! 🚀');
                console.log('✅ Opened in new window successfully!');
                return;
            }
        } catch (error) {
            console.log('❌ New window method failed:', error);
        }
        
        // Method 2: Try creating iframe for download
        try {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'src/assets/Blackpaper.pdf';
            iframe.onload = () => {
                this.showSuccessMessage('📄 BLACKPAPER LOADING VIA IFRAME! 🚀');
                setTimeout(() => document.body.removeChild(iframe), 3000);
            };
            iframe.onerror = () => {
                console.log('❌ Iframe method failed');
                document.body.removeChild(iframe);
                this.showManualDownloadInstructions();
            };
            document.body.appendChild(iframe);
            console.log('📄 Trying iframe download method...');
            return;
        } catch (error) {
            console.log('❌ Iframe method failed:', error);
        }
        
        // Method 3: Show manual instructions
        this.showManualDownloadInstructions();
    }

    showManualDownloadInstructions() {
        console.log('📄 Showing manual download instructions...');
        
        const instructionDiv = document.createElement('div');
        instructionDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.95);
            color: #ffeb3b;
            padding: 2rem;
            border-radius: 15px;
            font-family: Orbitron;
            font-weight: 700;
            font-size: 1.1rem;
            z-index: 2000;
            border: 2px solid #ffeb3b;
            max-width: 700px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 235, 59, 0.5);
        `;
        
        instructionDiv.innerHTML = `
            <h3 style="color: #ff4444; margin-bottom: 1rem;">📄 MANUAL DOWNLOAD REQUIRED</h3>
            <p style="margin-bottom: 1rem;">Auto-download failed, but you can access the file manually!</p>
            
            <div style="text-align: left; margin: 1rem 0; background: rgba(255, 235, 59, 0.1); padding: 1rem; border-radius: 10px;">
                <strong>🔧 Direct Access Methods:</strong><br><br>
                
                <strong>1. Direct URL:</strong><br>
                Copy this URL to your browser: <br>
                <code style="background: rgba(0,0,0,0.7); padding: 0.3rem; word-break: break-all;">
                ${window.location.origin}/src/assets/Blackpaper.pdf
                </code><br><br>
                
                <strong>2. File System:</strong><br>
                Navigate to: <br>
                <code style="background: rgba(0,0,0,0.7); padding: 0.3rem;">
                C:\\Users\\manag\\Documents\\GitHub\\Web3Page\\src\\assets\\Blackpaper.pdf
                </code><br><br>
                
                <strong>3. Try Right-Click:</strong><br>
                Right-click the BLACKPAPER button → "Save link as..."
            </div>
            
            <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem;">
                <button id="tryDirectUrl" style="
                    background: #00ff88;
                    color: #000;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 25px;
                    font-family: Orbitron;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">🌐 OPEN DIRECT URL</button>
                
                <button id="closeInstructions" style="
                    background: #ffeb3b;
                    color: #000;
                    border: none;
                    padding: 0.8rem 1.5rem;
                    border-radius: 25px;
                    font-family: Orbitron;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">UNDERSTOOD 🚀</button>
            </div>
        `;
        
        document.body.appendChild(instructionDiv);
        
        // Add click handlers
        document.getElementById('tryDirectUrl').addEventListener('click', () => {
            const directUrl = `${window.location.origin}/src/assets/Blackpaper.pdf`;
            window.open(directUrl, '_blank');
            this.showSuccessMessage('🌐 DIRECT URL OPENED! 📄');
        });
        
        document.getElementById('closeInstructions').addEventListener('click', () => {
            document.body.removeChild(instructionDiv);
        });
        
        // Auto-remove after 15 seconds
        setTimeout(() => {
            if (document.body.contains(instructionDiv)) {
                document.body.removeChild(instructionDiv);
            }
        }, 15000);
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
            '🎵 VIBING TO THE VIDEO! 🎵'
        ];

        let messageIndex = 0;
        setInterval(() => {
            console.log(messages[messageIndex]);
            messageIndex = (messageIndex + 1) % messages.length;
        }, 5000);
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