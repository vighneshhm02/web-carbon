# WebCarbon

A modern carbon footprint estimator for websites.

WebCarbon analyzes any URL, estimates CO₂ per page visit, computes a sustainability grade (`A–F`), and shows actionable optimization suggestions in a clean dashboard.

## Features

- URL scan using headless browser crawling (Puppeteer + CDP)
- Network metrics extraction (bytes, requests, scripts, images, fonts, response time, CDN hints)
- CO₂ estimation via Website Carbon API with formula fallback
- Sustainability score (`0–100`) + grade (`A–F`)
- Suggestions engine for performance + sustainability improvements
- Scan history and result detail pages
- Switchable backend storage mode: `memory` now, `mongo` later

## Tech Stack

- **Frontend:** React 19, Vite 6, Tailwind CSS 4, Recharts
- **Backend:** Node.js, Express 5, Puppeteer, Axios
- **Data Layer:** Memory mode (default) or MongoDB (configurable)

## Quick Start

### 1) Install dependencies

```bash
cd /home/shree/dev/tS/webcarbon/server
npm install
```

```bash
cd /home/shree/dev/tS/webcarbon/client
npm install
```

### 2) Start backend (memory mode)

`server/.env` should contain:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/webcarbon
STORAGE_MODE=memory
```

Run:

```bash
cd /home/shree/dev/tS/webcarbon/server
npm run dev
```

### 3) Start frontend

```bash
cd /home/shree/dev/tS/webcarbon/client
npm run dev
```

Open: `http://localhost:5173`

## Storage Modes

### `memory` (default)

- No MongoDB required
- Fast local development
- Data resets on server restart

### `mongo` (later)

- Persistent database storage
- Existing Mongo code is already implemented
- Enable by updating `server/.env`:

```env
STORAGE_MODE=mongo
MONGODB_URI=mongodb://localhost:27017/webcarbon
```

See full backend mode guide in [`backendsetup.md`](./backendsetup.md).

## Scripts

### Backend (`server`)

- `npm run dev` — start with Node watch mode
- `npm start` — start production server

### Frontend (`client`)

- `npm run dev` — start Vite dev server
- `npm run build` — build production assets
- `npm run preview` — preview build locally

## API Endpoints

Base URL: `http://localhost:5000/api`

- `POST /scan`
  - Body: `{ "url": "https://example.com" }`
- `GET /history`
- `GET /scan/:id`

## Project Structure

```text
webcarbon/
├── client/
├── server/
├── backendsetup.md
├── docs.md
└── README.md
```

## Troubleshooting

- **Vite proxy `ECONNREFUSED 127.0.0.1:5000`:** backend is not running
- **Scan history empty after restart:** expected in `memory` mode
- **Puppeteer browser issue:**

```bash
cd /home/shree/dev/tS/webcarbon/server
npx puppeteer browsers install chrome
```

## Documentation

- Detailed system docs: [`docs.md`](./docs.md)
- Backend mode and Mongo migration: [`backendsetup.md`](./backendsetup.md)
