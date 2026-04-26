# Configuration Guide - Port 8080 Setup

## Overview
The project has been configured to use port **8080** for the API backend instead of port 5096.

## Configuration Files

### Frontend (React/Vite)

#### Environment Files Location
- `.env` - Default environment variables
- `.env.local` - Local development overrides (not committed to git)
- `.env.production` - Production environment variables

#### API Configuration
The API base URL is managed in `src/utils/apiConfig.js` and uses the `VITE_API_BASE_URL` environment variable.

```javascript
// In any component:
import { API_BASE_URL } from '../utils/apiConfig';

// Usage
const response = await fetch(`${API_BASE_URL}/api/endpoint`);
```

### Backend (.NET)

#### Launch Configuration
File: `Movie.API/Properties/launchSettings.json`

The development profile now uses port **8080**:
```json
"applicationUrl": "http://localhost:8080",
"environmentVariables": {
  "ASPNETCORE_URLS": "http://localhost:8080"
}
```

#### Docker Configuration
File: `docker-compose.yml`

The backend service is already configured for port **8080**:
```yaml
backend:
  ports:
    - "8080:8080"
  environment:
    - ASPNETCORE_URLS=http://+:8080
```

## Running Locally

### Frontend
```bash
cd Kovix
npm install
npm run dev
```
Frontend will run on `http://localhost:5173` and connect to API at `http://localhost:8080`

### Backend
```bash
cd Movie.API
dotnet run
```
API will run on `http://localhost:8080`

### Using Docker
```bash
docker-compose up
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8080`
- Database: `localhost:1433`

## Changing the Port

### For Development (React)
Edit `.env.local`:
```env
VITE_API_BASE_URL=http://localhost:YOUR_PORT
```

### For Production (React)
Edit `.env.production`:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### For .NET Backend
Edit `launchSettings.json` or set environment variables:
```bash
set ASPNETCORE_URLS=http://localhost:YOUR_PORT
```

## Testing the Connection
Verify the API is accessible at `http://localhost:8080/swagger` (Swagger UI)

## Important Notes
- Never commit `.env.local` to the repository (it's for local development only)
- Frontend components now import `API_BASE_URL` from `apiConfig.js` for centralized management
- All hardcoded `http://localhost:5096` references have been replaced with environment variables
