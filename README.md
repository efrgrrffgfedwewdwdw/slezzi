# ✦ Slezzi — Deine persönliche Profilseite

A full-stack profile website. Users can register, create their own profile, and publish it publicly.

## Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) v16 or higher

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start
```

The app will be running at **https://slezzi.bio** (or `https://localhost:443` locally)

## Project Structure

```
/
├── server.js           — Express backend
├── package.json
├── public/
│   ├── index.html      — Landing page
│   ├── login.html      — Login page
│   ├── register.html   — Registration page
│   ├── dashboard.html  — Profile editor
│   ├── 404.html        — 404 page
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js      — Shared utilities
│       ├── dashboard.js — Editor logic
│       └── profile.js  — Public profile renderer
├── views/
│   └── profile.html    — Public profile template (SSR)
└── data/
    └── users.json      — Auto-created on first register
```

## Features

- **Registration & Login** — Username, email, password with bcrypt hashing + JWT auth
- **Dashboard** — Live preview editor: avatar, display name, bio, gradient background, social links, music player
- **Public Profiles** — Beautiful profile cards at `/:username` with animated particles, glass-morphism cards
- **Music Player** — Custom HTML5 audio player with progress bar and play/pause
- **View Counter** — Auto-incremented per profile visit
- **Responsive** — Works on all screen sizes

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | — | Register new user |
| POST | `/api/login` | — | Login, returns JWT |
| GET | `/api/me` | ✓ | Get own profile data |
| GET | `/api/profile/:username` | — | Get public profile |
| PUT | `/api/profile` | ✓ | Update own profile |

## Supported Social Platforms
Discord · Twitter/X · GitHub · Instagram · TikTok · YouTube · Twitch · Steam · Spotify · Website · Email

