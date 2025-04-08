from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import random
import json
import os
from pathlib import Path

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GameState(BaseModel):
    score: int
    high_score: int
    is_game_over: bool

class GameScore(BaseModel):
    score: int
    player_name: str

# File to store high scores
HIGH_SCORES_FILE = "high_scores.json"

def load_high_scores():
    if os.path.exists(HIGH_SCORES_FILE):
        with open(HIGH_SCORES_FILE, 'r') as f:
            return json.load(f)
    return {"high_scores": []}

def save_high_scores(scores):
    with open(HIGH_SCORES_FILE, 'w') as f:
        json.dump(scores, f)

@app.get("/")
async def read_root():
    return {"message": "Welcome to Flappy Bird API"}

@app.get("/high-scores")
async def get_high_scores():
    return load_high_scores()

@app.post("/high-scores")
async def add_high_score(score: GameScore):
    scores = load_high_scores()
    scores["high_scores"].append({
        "score": score.score,
        "player_name": score.player_name
    })
    # Sort by score in descending order and keep only top 10
    scores["high_scores"].sort(key=lambda x: x["score"], reverse=True)
    scores["high_scores"] = scores["high_scores"][:10]
    save_high_scores(scores)
    return {"message": "High score added successfully"}

@app.get("/game/state")
async def get_game_state():
    return {
        "score": 0,
        "high_score": max([score["score"] for score in load_high_scores()["high_scores"]]) if load_high_scores()["high_scores"] else 0,
        "is_game_over": False
    }

@app.get("/game/pipe-position")
async def get_pipe_position():
    # Generate random pipe positions
    gap_position = random.randint(100, 400)
    return {
        "gap_position": gap_position,
        "gap_size": 150
    }

@app.get("/favicon.ico")
async def get_favicon():
    favicon_path = Path(__file__).parent.parent / "frontend" / "src" / "assets" / "images" / "favicon.ico"
    if not favicon_path.exists():
        raise HTTPException(status_code=404, detail="Favicon not found")
    return FileResponse(favicon_path)