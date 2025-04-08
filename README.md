# Flappy Bird Game

A modern implementation of the classic Flappy Bird game using React for the frontend and Python (FastAPI) for the backend.

## Project Structure

```
.
├── frontend/          # React frontend application
└── backend/          # Python FastAPI backend
```

## Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn main:app --reload
   ```

## Game Controls
- Press SPACE or click to make the bird flap
- Try to navigate through the pipes
- Your score increases as you pass through pipes

## Technologies Used
- Frontend: React, TypeScript, Styled Components
- Backend: Python, FastAPI
- Game Physics: Matter.js 