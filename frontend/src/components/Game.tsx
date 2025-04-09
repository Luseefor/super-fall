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
        // Fetch initial high score
        const fetchHighScore = async () => {
            try {
                const response = await fetch('http://localhost:8000/high-scores');
                const data = await response.json();
                const scores = data.high_scores || [];
                const maxScore = Math.max(...scores.map((s: any) => s.score), 0);
                setHighScore(maxScore);
                console.log('Initial high score:', maxScore);
            } catch (error) {
                console.error('Error fetching high scores:', error);
            }
        };
        fetchHighScore();
    }, []);

    const handleScore = () => {
        setScore(prevScore => {
            const newScore = prevScore + 1;
            if (newScore > highScore) {
                setHighScore(newScore);
                // Save new high score to backend immediately
                fetch('http://localhost:8000/high-scores', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        score: newScore,
                        player_name: 'Player'
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('High score saved:', data);
                    })
                    .catch(error => {
                        console.error('Error saving high score:', error);
                    });
            }
            return newScore;
        });
    };

    const handleGameOver = () => {
        setIsGameOver(true);
        setIsGameStarted(false);

        // Refresh high scores after game over
        fetch('http://localhost:8000/high-scores')
            .then(response => response.json())
            .then(data => {
                const scores = data.high_scores || [];
                const maxScore = Math.max(...scores.map((s: any) => s.score), 0);
                setHighScore(maxScore);
                console.log('Updated high score:', maxScore);
            })
            .catch(error => {
                console.error('Error fetching high scores:', error);
            });
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