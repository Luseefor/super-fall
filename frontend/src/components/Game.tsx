import React, { useEffect, useRef, useState, useCallback } from 'react';
import styled from 'styled-components';
import { GameEngine } from './GameEngine';
import { Bird } from './Bird';
import { Pipe } from './Pipe';
import { Score } from './Score';
import { SplashScreen } from './SplashScreen';

const GameContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
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
            // Save new high score to backend
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

    const startGame = () => {
        setShowSplash(false);
        setIsGameStarted(true);
        setIsGameOver(false);
        setScore(0);
        if (gameRef.current) {
            gameRef.current.start();
        }
    };

    useEffect(() => {
        gameRef.current = new GameEngine({
            onGameOver: handleGameOver,
            onScore: handleScore,
        });

        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                if (showSplash) {
                    startGame();
                } else if (gameRef.current) {
                    gameRef.current.flap();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            if (gameRef.current) {
                gameRef.current.cleanup();
            }
        };
    }, [handleGameOver, showSplash]);

    return (
        <GameContainer>
            {showSplash ? (
                <SplashScreen onStart={startGame} />
            ) : (
                <>
                    <GameCanvas>
                        {isGameStarted && (
                            <>
                                <Bird />
                                <Pipe gapPosition={200} gapSize={150} />
                                <Score score={score} highScore={highScore} />
                            </>
                        )}
                    </GameCanvas>
                    {isGameOver && <GameOverText>Game Over!</GameOverText>}
                    {(!isGameStarted || isGameOver) && (
                        <StartButton onClick={startGame}>
                            {isGameOver ? 'Play Again' : 'Start Game'}
                        </StartButton>
                    )}
                </>
            )}
        </GameContainer>
    );
}; 