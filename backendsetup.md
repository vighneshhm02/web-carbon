# Backend Setup Guide (`WebCarbon`)

This project now supports two backend storage modes so you can run immediately without MongoDB and switch later without changing frontend API calls.

## Storage Modes

- `memory` (default for now):
  - No MongoDB required
  - Data is stored in server memory
  - Data is lost when server restarts
- `mongo` (for later):
  - Persistent storage in MongoDB
  - Uses existing Mongoose model and query flow

Storage mode is controlled by `server/.env`:

```env
STORAGE_MODE=memory
```

## Current (No MongoDB) Setup

`server/.env` already includes:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/webcarbon
STORAGE_MODE=memory
```

Run backend:

```bash
cd /home/shree/dev/tS/webcarbon/server
npm install
npm run dev
```

In this mode, backend logs:

- `Storage mode: memory (MongoDB connection skipped)`
- `Server running on port 5000`

## Switch to MongoDB Later

When MongoDB is installed and running, update `server/.env`:

```env
STORAGE_MODE=mongo
MONGODB_URI=mongodb://localhost:27017/webcarbon
```

Then start/restart backend:

```bash
cd /home/shree/dev/tS/webcarbon/server
npm run dev
```

Expected startup logs:

- `MongoDB connected`
- `Server running on port 5000`

## What Changed in Code

- `server/services/storageService.js`
  - Added storage abstraction with:
    - `createScanResult(...)`
    - `getRecentScanResults(...)`
    - `getScanResultById(...)`
  - Routes calls to memory or mongo based on `STORAGE_MODE`
- `server/controllers/carbonController.js`
  - Now uses storage service instead of directly calling `ScanResult`
- `server/index.js`
  - Connects to MongoDB only when `STORAGE_MODE=mongo`

## Important Notes

- Frontend and API endpoints remain unchanged.
- In `memory` mode, scan history will reset whenever backend restarts.
- In `mongo` mode, existing Mongoose schema/model are still fully active.
