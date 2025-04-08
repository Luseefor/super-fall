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
  background-image: url(${backgroundImage});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
`;

const GameCanvas = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
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
    const [birdPosition, setBirdPosition] = useState({ x: 0, y: 0, rotation: 0 });
    const gameEngine = useRef<GameEngine | null>(null);

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

    const handleScore = () => {
        setScore(prevScore => prevScore + 1);
    };

    const submitScore = async (finalScore: number) => {
        if (finalScore > highScore) {
            setHighScore(finalScore);
            try {
                await fetch('http://localhost:8000/high-scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        score: finalScore,
                        player_name: 'Player'
                    }),
                });
            } catch (error) {
                console.error('Error saving high score:', error);
            }
        }
    };

    const handleGameOver = () => {
        setIsGameOver(true);
        if (gameEngine.current) {
            const finalScore = score;
            submitScore(finalScore);
        }
    };

    const handleStart = () => {
        setShowSplash(false);
        setIsGameStarted(true);
        setScore(0);
        setIsGameOver(false);
        if (gameEngine.current) {
            gameEngine.current.start();
        }
    };

    const handleClick = () => {
        if (gameEngine.current && !isGameOver) {
            gameEngine.current.flap();
        } else if (isGameOver) {
            handleStart();
        }
    };

    useEffect(() => {
        const engine = new GameEngine({
            onGameOver: handleGameOver,
            onScore: handleScore,
        });
        gameEngine.current = engine;

        // Add keyboard handler
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (!isGameStarted || isGameOver) {
                    handleStart();
                } else {
                    handleClick();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (gameEngine.current) {
                gameEngine.current.cleanup();
            }
        };
    }, [isGameStarted, isGameOver]);  // Add dependencies for the event handler

    // Add bird position update effect
    useEffect(() => {
        if (!isGameStarted || isGameOver) return;

        const updateBirdPosition = () => {
            if (gameEngine.current) {
                const bird = gameEngine.current.getBird();
                if (bird) {
                    setBirdPosition({
                        x: bird.x,
                        y: bird.y,
                        rotation: bird.rotation * (90 / Math.PI)
                    });
                }
            }
            requestAnimationFrame(updateBirdPosition);
        };

        updateBirdPosition();
    }, [isGameStarted, isGameOver]);

    return (
        <GameContainer>
            {showSplash ? (
                <SplashScreen onStart={handleStart} />
            ) : (
                <>
                    <GameCanvas className="game-canvas">
                        {isGameStarted && (
                            <>
                                <Bird position={birdPosition} />
                                <Score score={score} highScore={highScore} />
                            </>
                        )}
                    </GameCanvas>
                    {isGameOver && <GameOverText>Game Over!</GameOverText>}
                    {(!isGameStarted || isGameOver) && (
                        <StartButton onClick={handleStart}>
                            {isGameOver ? 'Play Again' : 'Start Game'}
                        </StartButton>
                    )}
                </>
            )}
        </GameContainer>
    );
}; 