from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

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

# In-memory storage for high scores
high_scores: List[GameScore] = []

@app.get("/")
async def read_root():
    return {"message": "Welcome to Flappy Bird API"}

@app.get("/high-scores")
async def get_high_scores():
    return {"high_scores": sorted(high_scores, key=lambda x: x.score, reverse=True)[:5]}

@app.post("/high-scores")
async def add_high_score(score: GameScore):
    high_scores.append(score)
    return {"message": "Score added successfully"}

@app.get("/game/state")
async def get_game_state():
    return {
        "score": 0,
        "high_score": max([score.score for score in high_scores]) if high_scores else 0,
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