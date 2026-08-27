# Valorant Stats Dashboard

A web dashboard that displays Valorant player match history, performance analytics, agent stats, and map win rates using the Henrik Dev Valorant API.

## Tech Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React + Vite + Tailwind CSS v4

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js (v18+ recommended) & npm
- Henrik Dev Valorant API Key

### Environment Setup

1. Copy `.env.example` to `.env` in the root directory (or backend directory as needed):
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and add your Henrik Dev API key:
   ```env
   VALORANT_API_KEY=your_api_key_here
   ```

### Backend Setup

Navigate to the backend directory, install Python dependencies, and start the FastAPI server:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend server will run at `http://localhost:8000`.

### Frontend Setup

Navigate to the frontend directory, install dependencies, and run the development server:

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

## Disclaimer

This is a non-commercial fan-made project, not endorsed by Riot Games. Riot Games, Valorant, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
