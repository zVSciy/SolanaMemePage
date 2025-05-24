# 🚀 Solana Moon Dashboard 🌙

A cyberpunk-themed Solana dashboard featuring real-time price data, network statistics, and the latest memecoin launches from pump.fun and Raydium. Built with modern web technologies and designed for maximum meme energy!

## Features

- **Immersive Background Video** - Cyberpunk aesthetics with transparent UI elements
- **Epic Background Music** - Dual audio tracks with auto-play and volume boost
- **Real-time Solana Data** - Live SOL price from Jupiter API with 3-day price history
- **Memecoin Tracking** - Latest launches from pump.fun and Raydium with epic names
- **Wallet Integration** - Connect your Phantom wallet
- **Interactive Charts** - Price history and network activity visualization
- **Meme Aesthetics** - Floating emojis, neon effects, and bouncing animations

## 🛠Tech Stack

- **Frontend**: Vanilla JavaScript, CSS3, HTML5
- **Charts**: Chart.js
- **Bundler**: Webpack 5
- **Audio/Video**: Web Audio API with gain boosting
- **APIs**: Jupiter, CoinGecko, Raydium, Solana RPC
- **Deployment**: Docker & Docker Compose

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose (optional)
- Modern web browser with audio/video support

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Web3Page
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Add your assets**
   - Place your logo at `src/assets/logo.jpg`
   - Add background video at `src/assets/SaveTwitter.Net_1-vxWYYM6hFrth0-_(720p).mp4`
   - Add audio tracks:
     - `src/assets/SaveTwitter.Net-1859786065365827584-(128kbps).mp3`
     - `src/assets/SaveTwitter.Net-1873924385205346307-(128kbps).mp3`

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9000` and enjoy the moon mission! 🚀

### Docker Deployment

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

2. **For production with nginx**
   ```bash
   docker-compose --profile production up --build
   ```

3. **Access the dashboard**
   - Development: `http://localhost:9000`
   - Production: `http://localhost:80`

## Project Structure

```
Web3Page/
├── src/
│   ├── assets/          # Media files (video, audio, images)
│   ├── css/
│   │   └── styles.css   # Cyberpunk styling with neon effects
│   ├── js/
│   │   └── app.js       # Main application logic
│   └── index.html       # HTML template
├── dist/                # Built files (auto-generated)
├── webpack.config.js    # Webpack configuration
├── package.json         # Dependencies and scripts
├── Dockerfile          # Container configuration
├── docker-compose.yml  # Multi-container setup
└── README.md           # This file
```

## Usage

### Audio Controls
- **Sound Toggle**: Click the audio button in the header to control music
- **Auto-play**: Music starts automatically at maximum volume with gain boost
- **Track Cycling**: Two tracks loop continuously with seamless transitions

### Wallet Connection
- **Phantom Wallet**: Click "CONNECT WALLET" to link your Phantom wallet
- **Balance Display**: View your SOL balance after connection
- **Secure**: Uses official Phantom wallet adapter

### Data Filtering
- **Platform Filter**: Switch between ALL, PUMP.FUN, and RAYDIUM
- **Real-time Updates**: Data refreshes automatically
- **Moon Buttons**: Click for meme reactions

## Configuration

### Environment Variables
```bash
NODE_ENV=development          # or production
CHOKIDAR_USEPOLLING=true     # For Docker file watching
```

### API Endpoints
- **Jupiter**: `https://price.jup.ag/v4/price` - Real-time SOL price
- **CoinGecko**: `https://api.coingecko.com/api/v3/` - Price history & changes
- **Raydium**: `https://api.raydium.io/v2/main/pairs` - DEX pair data
- **Solana RPC**: `https://api.mainnet-beta.solana.com` - Network stats

## Deployment

### Production Build
```bash
npm run build
```

### Docker Production
```bash
# Build production image
docker build -t solana-moon-dashboard .

# Run production container
docker run -p 80:9000 solana-moon-dashboard
```

### With SSL (Production)
1. Add SSL certificates to `./ssl/` directory
2. Update `nginx.conf` with SSL configuration
3. Run with production profile

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/epic-feature`)
3. Commit your changes (`git commit -m 'Add epic feature'`)
4. Push to the branch (`git push origin feature/epic-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🌙 To the Moon!

Built with 💎🙌 by diamond hands for diamond hands. 

**Remember**: This is not financial advice, just epic meme energy! DYOR and HODL responsibly! 🚀

---

*"The moon is not our destination, it's just a pit stop on our way to the stars!"* ⭐

# All the diamond hands HODLers 💎🙌
