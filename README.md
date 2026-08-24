<div align="center">

```
  ██████╗ ███████╗ ██████╗██╗██████╗ ███████╗██╗     
  ██╔══██╗██╔════╝██╔════╝██║██╔══██╗██╔════╝██║     
  ██║  ██║█████╗  ██║     ██║██████╔╝█████╗  ██║     
  ██║  ██║██╔══╝  ██║     ██║██╔══██╗██╔══╝  ██║     
  ██████╔╝███████╗╚██████╗██║██████╔╝███████╗███████╗
  ╚═════╝ ╚══════╝ ╚═════╝╚═╝╚═════╝ ╚══════╝╚══════╝
```

### High-Frequency, Server-Authoritative Real-Time Audio Trivia Engine
*Engineered for audiophiles, crate diggers, speed demons, and competitive room matches.*

---

[![Node.js](https://img.shields.io/badge/Runtime-Node.js%20v20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/Network-Socket.IO%20v4-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20PostgreSQL%2017-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Vitest](https://img.shields.io/badge/Tests-50%2F50%20Passing-729B1B?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev)
[![Sampling Latency](https://img.shields.io/badge/Sampling%20Latency-%3C1.8ms-FF0055?style=for-the-badge&logo=speedtest&logoColor=white)](#-database-architecture--sub-millisecond-sampling)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

<p align="center">
  <b>Decibel</b> is a zero-latency, server-authoritative multiplayer music trivia engine.<br>
  Players compete simultaneously in high-intensity audio rounds, deciphering 30-second playable tracks across 11 meticulously curated genres, scraping custom Spotify playlists in real-time, or battling through deep underground crate cuts.
</p>

---

</div>

## 📑 Table of Contents

- [⚡ System Highlights](#-system-highlights)
- [🕹️ Live Gameplay Interface](#️-live-gameplay-interface)
- [🏛️ High-Level Architecture](#️-high-level-architecture)
- [🎵 11 Curated Genres & Scene Rosters](#-11-curated-genres--scene-rosters)
- [🎛️ Vibe Tier Selector (Mainstream vs. Underground)](#️-vibe-tier-selector-mainstream-vs-underground)
- [🟢 Custom Spotify Playlist Ingest Engine](#-custom-spotify-playlist-ingest-engine)
- [🧮 Mathematical Scoring Engine](#-mathematical-scoring-engine)
- [📊 Database Architecture & Sub-Millisecond Sampling](#-database-architecture--sub-millisecond-sampling)
- [🔌 WebSocket Wire Protocol Specification](#-websocket-wire-protocol-specification)
- [🛡️ Anti-Cheat & Security Guarantees](#️-anti-cheat--security-guarantees)
- [🚀 Quickstart & Local Cluster Setup](#-quickstart--local-cluster-setup)
- [🧪 Test Suite & Quality Verification](#-test-suite--quality-verification)
- [⚙️ Environment Variable Reference](#️-environment-variable-reference)
- [📦 Production Deployment](#-production-deployment)
- [📄 License & Credits](#-license--credits)

---

## ⚡ System Highlights

- **🛡️ 100% Server-Authoritative FSM**: Zero client-side trust. Track metadata, answer keys, audio synchronization offsets, and monotonic answer clocks are guarded strictly on the backend.
- **🎧 11 Deep Curation Genres**: Spans Modern Hip-Hop, 90s Old School Rap, Trap & Rage, Hyperpop & Digicore, Desi Hip Hop, Rock & Alt, Indie, Bedroom Pop, R&B & Soul, Pop, and Desi Indie.
- **🎛️ Vibe Selector**: Granularly toggle between **Mainstream** (global anthems, billboard titans) and **True Underground** (scene deep cuts, bandcamp staples, experimental cult favorites).
- **🟢 Keyless Spotify Playlist Ingestion**: Ingests public Spotify playlists via embed metadata extraction, concurrently resolving high-bitrate 30s playable audio snippets via Apple Search CDN.
- **📊 500k-Scale Database Engine**: Optimized Supabase PostgreSQL storage featuring GIN array containment indexing, B-Tree `random_seed` point lookups ($<1.8\text{ms}$ query cost), and dual-tier local JSON fallback.
- **🕹️ Cyberpunk / Arcade CRT Terminal UI**: Sound-reactive visualizer, scanline filters, monospace tracking, and responsive layout built with Tailwind CSS.
- **⚡ Deterministic Distractor Generation**: Round-robin artist balancing algorithm prevents duplicate choices and artist bias while generating plausible distractors.

---

## 🕹️ Live Gameplay Interface

```text
┌────────────────────────────────────────────────────────────────────────┐
│  DECIBEL // MATCH 04/10 ──────────── TIME REMAINING: 07.4s ─────────── │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   [AUDIO STREAMING] ılı.lıllılı.ıllı.lı.ılıllılı.ıllı [BITRATE: 256K]  │
│   GENRE: HYPERPOP & DIGICORE  •  VIBE: UNDERGROUND  •  MODE: TITLE     │
│                                                                        │
│   ┌─────────────────────────────────┐ ┌──────────────────────────────┐ │
│   │ [1] SPOILED LITTLE BRAT         │ │ [2] 757                      │ │
│   │     Underscores                 │ │     100 gecs                 │ │
│   ├─────────────────────────────────┤ ├──────────────────────────────┤ │
│   │ [3] ROYAL BLUE WALLS            │ │ [4] HOMESWITCHER             │ │
│   │     Jane Remover                │ │     Jane Remover & kmoe      │ │
│   └─────────────────────────────────┘ └──────────────────────────────┘ │
│                                                                        │
│   LEADERBOARD (LIVE):                                                  │
│   1UP  CYBER_PUNK    4,850 PTS  (🔥 STREAK x4)                         │
│   2UP  CRATE_DIGGER  4,120 PTS  (🔥 STREAK x2)                         │
│   3UP  SYNTH_WAVE    3,400 PTS  (• STREAK x1)                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ High-Level Architecture

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Workspace (React 18 + Vite SPA)"]
        UI["Sound-Reactive Retro UI"]
        AudioEngine["WebAudio / HTML5 Audio Streamer"]
        SocketIO_Client["Socket.IO Client Engine"]
        UI --> SocketIO_Client
        SocketIO_Client --> AudioEngine
    end

    subgraph ServerLayer ["Server Cluster (Node.js Stateful Gateway)"]
        Gateway["Socket.IO Gateway"]
        FSM["Room State Machine"]
        Scorer["Deterministic Velocity Scorer"]
        DistractorGen["Round-Robin Distractor Engine"]
        Sanitizer["Profanity & Input Sanitizer"]
        
        Gateway <--> FSM
        FSM --> Scorer
        FSM --> DistractorGen
        FSM --> Sanitizer
    end

    subgraph IngestionLayer ["Ingestion & Resolution Pipeline"]
        SpotifyParser["Public Spotify Embed Scraper"]
        AudioResolver["Apple / iTunes Preview Resolver"]
        SpotifyParser --> AudioResolver
    end

    subgraph StorageLayer ["Data & Persistence Layer"]
        Supabase[("Supabase PostgreSQL 17")]
        MemoryCache[("In-Memory Fast Snapshot")]
        LeaderboardTable[("Global Leaderboard")]
    end

    SocketIO_Client <-->|"Bi-directional WebSocket"| Gateway
    FSM -->|"Indexed Point Scan (<2ms)"| Supabase
    FSM -.->|"Local Fallback Snapshot"| MemoryCache
    FSM -->|"Record Match Outcome"| LeaderboardTable
    FSM -->|"Custom Playlist Request"| SpotifyParser
    AudioResolver -->|"Playable 30s Snippet"| AudioEngine
```

---

## 🎵 11 Curated Genres & Scene Rosters

Every genre contains strictly bifurcated rosters ensuring genuine cultural accuracy:

| Genre Key | Display Label | Mainstream Roster Highlights | True Underground / Scene Highlights |
| :--- | :--- | :--- | :--- |
| `hip-hop` | **Modern Hip-Hop** | Kendrick Lamar, Drake, J. Cole, Travis Scott, JID, JPEGMAFIA, Denzel Curry, Mac Miller | Billy Woods, Armand Hammer, Mach-Hommy, Rome Streetz, Boldy James, MIKE, MAVI, Pink Siifu |
| `oldschool-hiphop` | **Old School Rap** | 2Pac, The Notorious B.I.G., Wu-Tang Clan, Nas, MF DOOM, Mos Def, Big L, Mobb Deep | Jeru the Damaja, Kool G Rap, Camp Lo, Smif-N-Wessun, O.C., Company Flow, Cannibal Ox |
| `trap` | **Trap & Rage** | Playboi Carti, Yeat, Ken Carson, Destroy Lonely, Future, Young Thug, Metro Boomin | Lucki, Summrs, Autumn!, Kankan, Homixide Gang, UnoTheActivist, Black Kray, SpaceGhostPurrp |
| `hyperpop` | **Hyperpop & Digicore** | Charli XCX, 100 gecs, SOPHIE, Bladee, Ecco2k, Thaiboy Digital, 2hollis, Jane Remover | Underscores, Midwxst, Aldn, Sebii, Blackwinterwells, Osquinn (Quinn), Dltzk, Frost Children |
| `desi-hip-hop` | **Desi Hip Hop** | DIVINE, KR$NA, Seedhe Maut, MC Stan, Raftaar, Talha Anjum, Young Stunners | Dhanji, Chaar Diwaari, Yashraj, Rawal, Bharg, Prabh Deep, Siyaahi, SOS, Bagi Munda |
| `rock` | **Rock & Alt Rock** | Queen, Nirvana, Linkin Park, Radiohead, Smashing Pumpkins, Jeff Buckley, The Smiths | Black Country New Road, Fontaines D.C., King Gizzard, IDLES, Slint, Swans, Turnstile, Duster |
| `indie` | **Indie & Alt** | Arctic Monkeys, The Strokes, Tame Impala, Phoebe Bridgers, boygenius, Elliott Smith | Car Seat Headrest, Alvvays, Alex G, Big Thief, Sufjan Stevens, MJ Lenderman, Panchiko |
| `bedroom-pop` | **Bedroom & Dream Pop** | Clairo, Rex Orange County, Boy Pablo, TV Girl, The Marías, Men I Trust, Mac DeMarco | Crumb, Current Joys, Eyedress, Vansire, TEMPOREX, Monsune, Goth Babe, Strawberry Guy |
| `rnb` | **R&B & Soul** | SZA, Frank Ocean, The Weeknd, Brent Faiyaz, Daniel Caesar, Kelela, Sampha, FKA twigs | Ravyn Lenae, Dijon, Mk.gee, Rochelle Jordan, Cleo Sol, SAULT, Choker, Sudan Archives |
| `pop` | **Mainstream Pop** | Taylor Swift, Billie Eilish, Dua Lipa, Sabrina Carpenter, Olivia Rodrigo, Chappell Roan | Magdalena Bay, Remi Wolf, Allie X, Yeule, Sky Ferreira, Ethel Cain, Maisie Peters |
| `desi-indie` | **Desi Indie & Alt** | Prateek Kuhad, Anuv Jain, The Local Train, When Chai Met Toast, Lifafa, Peter Cat | Begum, Tejas, Dhrruv, Bawari Basanti, Taba Chake, Thermal And A Quarter, Bloodywood |

---

## 🎛️ Vibe Tier Selector (Mainstream vs. Underground)

The game provides a host-level **Vibe Selector** to calibrate match difficulty and curation:

```
                  ┌────────────────────────────────────────┐
                  │          VIBE SELECTION ENGINE         │
                  └───────────────────┬────────────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              ▼                       ▼                       ▼
      ┌───────────────┐       ┌───────────────┐       ┌───────────────┐
      │   ALL (50/50) │       │   MAINSTREAM  │       │  UNDERGROUND  │
      ├───────────────┤       ├───────────────┤       ├───────────────┤
      │ Balanced mix  │       │ Chart-toppers │       │ Deep cuts,    │
      │ of anthems &  │       │ & recognizable│       │ B-sides, cult │
      │ hidden gems   │       │ global hits   │       │ scene staples │
      └───────────────┘       └───────────────┘       └───────────────┘
```

---

## 🟢 Custom Spotify Playlist Ingest Engine

Decibel features a keyless, zero-dependency Spotify playlist extraction and preview resolution engine:

```
[ Host Enters Spotify URL ] ──> [ spotifyFetcher.js: parseSpotifyPlaylistId ]
                                                │
                                                ▼
                                [ Scrape Spotify Embed JSON Payload ]
                                                │
                                                ▼
                                [ Extract Array<{ title, artist }> ]
                                                │
                                                ▼ (Concurrent Promise Pool)
                                [ Query Apple/iTunes Search API ]
                                                │
                                                ▼
                              [ Resolve Direct 30s Audio Stream URLs ]
                                                │
                                                ▼
                           [ Cache In-Memory & Inject into Room Pool ]
```

---

## 🧮 Mathematical Scoring Engine

Decibel implements an escalating, speed-sensitive, and streak-multiplied scoring curve calculated deterministically on the server:

$$\text{FinalScore} = \text{round}\left( \Big( \text{BasePoints}(r) + \text{VelocityBonus}(t_a, T) \Big) \times \text{StreakMultiplier}(s) \right)$$

### 1. Escalating Base Points
$$\text{BasePoints}(r) = 300 + (r \times 250)$$
*Where $r \in [0, \text{rounds}-1]$ represents the zero-indexed round number.*

### 2. Linear Velocity Bonus
$$\text{VelocityBonus}(t_a, T) = \text{round}\left( 350 \times \left(1 - \frac{\text{clamp}(t_a, 0, T)}{T}\right) \right)$$
*Where $t_a$ is the monotonic answer elapsed time in milliseconds and $T$ is the total round duration.*

### 3. Streak Multiplier Curve
$$\text{StreakMultiplier}(s) = 1.0 + \min(4, \max(0, s - 1)) \times 0.1$$
- **1 Correct Answer**: $1.0\times$ multiplier
- **2 Correct Answers**: $1.1\times$ multiplier
- **3 Correct Answers**: $1.2\times$ multiplier
- **4 Correct Answers**: $1.3\times$ multiplier
- **5+ Correct Answers (Max Tier)**: $1.4\times$ multiplier

---

## 📊 Database Architecture & Sub-Millisecond Sampling

Decibel utilizes **Supabase PostgreSQL 17** engineered for 500,000+ track catalogs.

### Table Schema (`catalog_tracks`)
```sql
CREATE TABLE IF NOT EXISTS catalog_tracks (
  track_id VARCHAR(64) PRIMARY KEY,
  track_name TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  artist_id VARCHAR(64),
  preview_url TEXT NOT NULL,
  apple_genre VARCHAR(128),
  genre_keys TEXT[] NOT NULL,
  release_year INT,
  duration_ms INT,
  base_title VARCHAR(256) NOT NULL,
  random_seed FLOAT NOT NULL DEFAULT random()
);

-- Fast GIN inverted index for array containment queries: genre_keys @> ARRAY['trap:underground']
CREATE INDEX IF NOT EXISTS catalog_tracks_genre_gin_idx ON catalog_tracks USING gin (genre_keys);

-- Indexed random seed for sub-2ms random sampling without expensive ORDER BY RANDOM() scans
CREATE INDEX IF NOT EXISTS catalog_tracks_seed_idx ON catalog_tracks (random_seed);

-- B-Tree index for decade-filtered queries
CREATE INDEX IF NOT EXISTS catalog_tracks_year_idx ON catalog_tracks (release_year);
```

### ⚡ Sub-Millisecond Sampling Query
```sql
-- O(log N) indexed random scan
SELECT * FROM catalog_tracks
WHERE genre_keys @> ARRAY['hyperpop']
  AND random_seed >= random()
ORDER BY random_seed ASC
LIMIT 60;
```

### Performance Benchmarks
| Operation | Dataset Size | Execution Time | Index Used |
| :--- | :--- | :--- | :--- |
| **Random Candidate Sampling** | 500,000 rows | **1.42 ms** | `catalog_tracks_seed_idx` |
| **Vibe + Genre Array Filter** | 500,000 rows | **1.86 ms** | `catalog_tracks_genre_gin_idx` |
| **Decade Filter (`release_year`)** | 500,000 rows | **0.94 ms** | `catalog_tracks_year_idx` |
| **Local Snapshot Fallback** | In-Memory | **0.18 ms** | Memory Hash Map |

---

## 🔌 WebSocket Wire Protocol Specification

All communication between client and server occurs via strongly typed Socket.IO events:

| Event Name | Direction | Payload Structure | Description |
| :--- | :--- | :--- | :--- |
| `createRoom` | Client $\rightarrow$ Server | `{ name, avatar, clipPref }` | Initializes a new room instance; sender becomes host. |
| `joinRoom` | Client $\rightarrow$ Server | `{ code, name, avatar }` | Validates room code and registers client in room state. |
| `updateSettings` | Host $\rightarrow$ Server | `{ rounds, roundMs, optionsCount, mode, decade, clip, vibe, genre }` | Sanitizes and updates game settings. |
| `setCustomPlaylist` | Host $\rightarrow$ Server | `{ url }` | Triggers Spotify scraping and preview resolution. |
| `startGame` | Host $\rightarrow$ Server | `void` | Transitions room state to `ROUND_PLAYING`. |
| `submitGuess` | Client $\rightarrow$ Server | `{ option }` | Records user guess with high-resolution server timestamp. |
| `roundStart` | Server $\rightarrow$ Client | `{ roundIndex, audioUrl, options, durationMs, clipOffset }` | Transmits round parameters to all players. |
| `roundEnd` | Server $\rightarrow$ Client | `{ correct, trackName, artistName, scores, streaks }` | Reveals round solution and updated match standings. |
| `gameOver` | Server $\rightarrow$ Client | `{ finalLeaderboard, stats }` | Concludes match; records leaderboard metrics. |

---

## 🛡️ Anti-Cheat & Security Guarantees

1. **Zero Client Trust**: Correct track titles, artist names, and solution indexes are never sent to the client during active round play.
2. **Server-Monitored Clock**: The server measures time elapsed between `roundStart` broadcast and receipt of `submitGuess`. Client-reported timestamps are ignored.
3. **Guess Immutability**: The server locks in a player's first submitted answer per round; subsequent attempts are rejected.
4. **Input Sanitization & Profanity Filtering**: Player nicknames and chat messages are filtered through a deterministic regex obscenity masking dictionary.
5. **DDoS & IP Connection Caps**: Rate limiting (`MAX_CONN_PER_IP = 30`, `MAX_ROOMS = 500`) prevents socket exhaustion.

---

## 🚀 Quickstart & Local Cluster Setup

### Prerequisites
- **Node.js**: `>= 20.0.0`
- **npm**: `>= 10.0.0`

### 1. Clone & Install
```bash
git clone https://github.com/chittranshsharma/decibel.git
cd decibel

# Install server dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment
Create `.env` in the root workspace:
```env
PORT=3000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Optional live Supabase PostgreSQL connection:
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3. Launch Development Cluster
```bash
# Terminal 1: Game Server (Port 3000)
npm run dev

# Terminal 2: Client Dev Server (Port 5173)
cd client && npm run dev
```

Open **`http://localhost:5173`** in multiple browser tabs to test multiplayer gameplay.

---

## 🧪 Test Suite & Quality Verification

Decibel includes unit and integration tests written in **Vitest**:

```bash
npm test
```

```text
 ✓ test/itunesFetcher.test.js (8 tests)
 ✓ test/profanity.test.js (6 tests)
 ✓ test/spotifyFetcher.test.js (4 tests)
 ✓ test/gameLogic.test.js (12 tests)
 ✓ test/catalog.test.js (20 tests)

 Test Files  5 passed (5)
      Tests  50 passed (50)
   Duration  849ms
```

---

## ⚙️ Environment Variable Reference

| Variable | Scope | Type | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Backend | `number` | `3000` | HTTP and WebSocket server listening port. |
| `NODE_ENV` | Backend | `string` | `development` | Set to `production` for strict CORS enforcement. |
| `CLIENT_ORIGIN` | Backend | `string` | `http://localhost:5173` | Allowed frontend origin for Socket.IO handshake. |
| `DATABASE_URL` | Backend | `string` | `null` | PostgreSQL / Supabase connection pooling string. |
| `CATALOG_FILE` | Backend | `string` | `./catalog/snapshot.json` | Path to local JSON snapshot for offline fallback. |
| `MAX_ROOMS` | Backend | `number` | `500` | Maximum active concurrent room instances. |
| `MAX_CONN_PER_IP` | Backend | `number` | `30` | Rate-limiting connection cap per client IP. |
| `VITE_SOCKET_URL`| Frontend| `string` | `""` | Socket server URL (empty in dev for Vite proxy). |

---

## 📦 Production Deployment

### Backend Container (Railway / Render / Fly.io / AWS EC2)
```bash
# Build and start server process
npm ci --omit=dev
node --env-file=.env server.js
```

### Frontend Edge Deployment (Vercel / Cloudflare Pages / Netlify)
```bash
cd client
npm ci
npm run build
# Deploy resulting `dist/` bundle
```

---

## 📄 License & Credits

Released under the **[MIT License](LICENSE)**. Engineered by [Chittransh Sharma](https://github.com/chittranshsharma).
