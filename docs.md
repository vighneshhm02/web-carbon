# WebCarbon Documentation

## Overview

WebCarbon is a full-stack MERN-style web application that estimates carbon footprint per website visit. Users submit a URL, the backend crawls the page with Puppeteer and CDP network events, computes metrics, fetches Website Carbon API data (or uses a fallback formula), calculates a sustainability score and grade, generates optimization suggestions, stores scan records in MongoDB, and shows a dashboard in React.

## Tech Stack

### Backend

- Node.js + Express 5 (`server/index.js`)
- MongoDB + Mongoose (`server/models/ScanResult.js`)
- Puppeteer (`server/services/crawlerService.js`)
- Axios for external API requests (`server/services/websiteCarbonAPI.js`)
- CORS + dotenv

### Frontend

- React 19 + Vite 6 (`client/src`)
- React Router DOM 7 (`client/src/App.jsx`)
- Recharts for visualization (`client/src/components/BreakdownChart.jsx`)
- TailwindCSS 4 via Vite plugin (`client/vite.config.js`, `client/src/index.css`)

## Project Structure

```text
webcarbon/
├── server/
│   ├── package.json
│   ├── .env
│   ├── index.js
│   ├── routes/
│   │   └── carbonRoutes.js
│   ├── controllers/
│   │   └── carbonController.js
│   ├── models/
│   │   └── ScanResult.js
│   ├── services/
│   │   ├── crawlerService.js
│   │   ├── websiteCarbonAPI.js
│   │   └── carbonService.js
│   └── utils/
│       └── scorer.js
└── client/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── api/
    │   │   └── carbon.js
    │   ├── components/
    │   │   ├── Loader.jsx
    │   │   ├── URLInput.jsx
    │   │   ├── ScoreCard.jsx
    │   │   ├── BreakdownChart.jsx
    │   │   ├── SuggestionsList.jsx
    │   │   └── HistoryTable.jsx
    │   └── pages/
    │       ├── Home.jsx
    │       └── Results.jsx
```

## Backend Details

### `server/index.js`

- Loads environment variables with `dotenv.config()`.
- Creates Express app with:
  - `cors({ origin: 'http://localhost:5173' })`
  - `express.json()`
- Mounts routes under `/api`.
- Connects to MongoDB through `process.env.MONGODB_URI`.
- Adds a global error handler returning:

```json
{ "error": "<message>" }
```

### API Endpoints

All endpoints are under `/api`:

- `POST /scan`
  - Body: `{ "url": "https://example.com" }`
  - Validates presence and URL format.
  - Runs crawl + CO2 pipeline.
  - Saves and returns created scan document.
- `GET /history`
  - Returns latest 20 scans sorted by `scannedAt` descending.
- `GET /scan/:id`
  - Returns one scan by MongoDB id.
  - Returns `404` if not found.

### Data Model

`ScanResult` fields:

- `url`: scanned URL
- `scannedAt`: timestamp
- `metrics`:
  - `totalBytes`
  - `totalRequests`
  - `thirdPartyScripts`
  - `imageSize`
  - `fontSize`
  - `responseTime`
  - `isCDN`
  - `isGreenHosting`
- `co2`:
  - `grams`
  - `gramsRenewable`
  - `source` (`api` or `formula`)
- `score`: numeric sustainability score (0–100)
- `grade`: `A`–`F`
- `suggestions`: array of optimization recommendations

### Crawl Service (`crawlerService.js`)

Flow:

1. Launches headless browser using:
   - `--no-sandbox`
   - `--disable-setuid-sandbox`
2. Creates CDP session and enables network tracking.
3. Captures:
   - `Network.responseReceived`
   - `Network.loadingFinished`
4. Navigates with `waitUntil: 'networkidle2'` and measures response time.
5. Computes:
   - total bytes
   - request count
   - third-party JS count
   - image bytes
   - font bytes
   - CDN detection from response headers
6. Returns normalized metrics with default `isGreenHosting: false`.

Error handling ensures browser closure in both success and failure paths.

### Website Carbon API Service (`websiteCarbonAPI.js`)

Calls:

`GET https://api.websitecarbon.com/site?url=<encoded_url>`

Extracts:

- `statistics.co2.grid.grams`
- `statistics.co2.renewable.grams`
- `green`

Returns:

```json
{
  "grams": 0.1234,
  "gramsRenewable": 0.0222,
  "isGreenHosting": true,
  "source": "api"
}
```

### Fallback Carbon Estimation (`carbonService.js`)

When API fails, backend uses:

$$
\text{energyKwh} = \left(\frac{\text{totalBytes}}{10^9}\right) \times 0.81
$$

$$
\text{co2Grams} = \text{energyKwh} \times 442
$$

If green hosting is true, an adjusted value is applied:

$$
\text{adjusted} = \text{co2Grams} \times 0.18
$$

### Scoring and Suggestions (`scorer.js`)

Grade thresholds:

- `A`: `< 0.1g`
- `B`: `0.1–0.3g`
- `C`: `0.3–0.6g`
- `D`: `0.6–1.0g`
- `E`: `1.0–2.0g`
- `F`: `> 2.0g`

Score formula:

$$
\text{score} = \max\left(0, \min\left(100, 100 - \frac{\text{co2Grams}}{2.0} \times 100\right)\right)
$$

Suggestions are generated from image size, font size, third-party script count, request count, response time, and green hosting status.

## Frontend Details

### App Routing

- `/` → `Home`
- `/results/:id` → `Results`

### Core UI Components

- `URLInput`: URL validation and scan trigger
- `Loader`: full-screen progress overlay with rotating messages
- `HistoryTable`: recent scan listing with clickable rows
- `ScoreCard`: sustainability grade, score, CO₂, source, and badges
- `BreakdownChart`: pie chart (images/fonts/other) plus summary stats
- `SuggestionsList`: actionable improvement list with context iconography

### Pages

- `Home`:
  - Fetches recent scan history on mount.
  - Submits scan request and navigates to result page.
  - Displays loader while scanning.
- `Results`:
  - Fetches scan by id.
  - Displays card/chart/suggestions layout.
  - Includes raw metrics grid and back navigation.

## Runtime Flow

1. User submits URL from frontend.
2. Frontend calls `POST /api/scan`.
3. Backend crawls URL and computes metrics.
4. Backend attempts Website Carbon API.
5. Backend falls back to formula on API failure.
6. Backend computes score + grade + suggestions.
7. Backend stores scan in MongoDB.
8. Frontend displays result dashboard.

## Setup and Run

### Prerequisites

- Node.js 20+
- MongoDB running locally
- npm

### Start Commands

```bash
# Terminal 1
mongod
```

```bash
# Terminal 2
cd server
npm install
npm run dev
```

```bash
# Terminal 3
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

### Puppeteer Browser Install (if needed)

```bash
cd server
npx puppeteer browsers install chrome
```

## Error Handling Strategy

- Every async backend controller and service function uses `try/catch`.
- Controller forwards unexpected errors to centralized Express error middleware.
- Frontend API calls catch request failures and show user-facing messages.

## API Response Example

```json
{
  "_id": "67e5ba0a5d8f49e6a31a3b21",
  "url": "https://example.com",
  "scannedAt": "2026-03-28T10:30:00.000Z",
  "metrics": {
    "totalBytes": 1452000,
    "totalRequests": 62,
    "thirdPartyScripts": 7,
    "imageSize": 820000,
    "fontSize": 125000,
    "responseTime": 1680,
    "isCDN": true,
    "isGreenHosting": false
  },
  "co2": {
    "grams": 0.5192,
    "gramsRenewable": 0.0935,
    "source": "formula"
  },
  "score": 74,
  "grade": "C",
  "suggestions": [
    "Compress and convert images to WebP format to reduce image payload",
    "Remove or defer third-party scripts — currently loading 7 external scripts"
  ]
}
```

## Notes

- The application intentionally uses dark-only UI styling.
- Server and client package versions are pinned as requested in dependency ranges.
- Frontend requests rely on Vite dev proxy so `/api` targets backend port `5000`.