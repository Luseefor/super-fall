import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { GameEngine } from './GameEngine';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { Score } from './Score';
import { SplashScreen } from './SplashScreen';
import backgroundImage from '../assets/images/background.png';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background-color: #87CEEB;  /* Fallback color */
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const GameCanvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;

  &.game-canvas {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
  }
`;

const GameElements = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StartButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 15px 30px;
  font-size: 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background-color: #45a049;
  }
`;

const GameOverText = styled.div`
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  color: #FF0000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

export const Game: React.FC = () => {
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [showSplash, setShowSplash] = useState(true);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);
    const [birdPosition, setBirdPosition] = useState({ x: 0, y: 0 });
    const gameRef = useRef<GameEngine | null>(null);

    useEffect(() => {
        // Fetch high score from backend
        fetch('http://localhost:8000/high-scores')
            .then(response => response.json())
            .then(data => {
                if (data.high_scores && data.high_scores.length > 0) {
                    setHighScore(data.high_scores[0].score);
                }
            })
            .catch(error => console.error('Error fetching high scores:', error));
    }, []);

    const handleGameOver = useCallback(async () => {
        setIsGameOver(true);
        if (score > highScore) {
            setHighScore(score);
            try {
                await fetch('http://localhost:8000/high-scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        score: score,
                        player_name: 'Player'
                    }),
                });
            } catch (error) {
                console.error('Error saving high score:', error);
            }
        }
    }, [score, highScore]);

    const handleScore = () => {
        setScore(prev => prev + 1);
    };

    // Add effect to update bird position
    useEffect(() => {
        if (!gameRef.current) return;

        const updateBirdPosition = () => {
            if (gameRef.current) {
                const bird = gameRef.current.getBird();
                if (bird) {
                    setBirdPosition({
                        x: bird.position.x,
                        y: bird.position.y
                    });
                }
            }
            requestAnimationFrame(updateBirdPosition);
        };

        updateBirdPosition();
    }, [isGameStarted]);

    useEffect(() => {
        // Initialize game engine only once
        if (!gameRef.current) {
            console.log('Creating new game engine...');
            gameRef.current = new GameEngine({
                onGameOver: handleGameOver,
                onScore: handleScore,
            });
        }

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                console.log('Space key pressed, game state:', { showSplash, isGameOver });
                if (showSplash || isGameOver) {
                    startGame();
                } else if (gameRef.current) {
                    console.log('Flapping bird...');
                    gameRef.current.flap();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (gameRef.current) {
                console.log('Cleaning up game engine...');
                gameRef.current.cleanup();
                gameRef.current = null;
            }
        };
    }, []); // Remove dependencies to prevent recreation

    const startGame = useCallback(() => {
        console.log('Starting game...');
        setShowSplash(false);
        setIsGameStarted(true);
        setIsGameOver(false);
        setScore(0);

        // Ensure game engine is initialized
        if (!gameRef.current) {
            console.log('Creating new game engine for game start...');
            gameRef.current = new GameEngine({
                onGameOver: handleGameOver,
                onScore: handleScore,
            });
        }

        // Start the game
        console.log('Starting game engine...');
        gameRef.current.start();
    }, [handleGameOver, handleScore]);

    // Add effect to preload background image
    useEffect(() => {
        const img = new Image();
        img.src = backgroundImage;
    }, []);

    return (
        <GameContainer>
            {showSplash ? (
                <SplashScreen onStart={startGame} />
            ) : (
                <>
                    <GameCanvas className="game-canvas" />
                    <GameElements>
                        {isGameStarted && (
                            <>
                                <Bird position={birdPosition} />
                                <Pipe gapPosition={200} gapSize={150} />
                                <Score score={score} highScore={highScore} />
                            </>
                        )}
                    </GameElements>
                    {isGameOver && <GameOverText>Game Over!</GameOverText>}
                    {(!isGameStarted || isGameOver) && (
                        <StartButton onClick={startGame}>
                            {isGameOver ? 'Play Again' : 'Press Space to Start'}
                        </StartButton>
                    )}
                </>
            )}
        </GameContainer>
    );
}; 