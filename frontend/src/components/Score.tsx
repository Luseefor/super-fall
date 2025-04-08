import React from 'react';
import styled from 'styled-components';

const ScoreContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 10px;
  color: white;
  font-family: Arial, sans-serif;
  z-index: 2;
`;

const ScoreText = styled.div`
  font-size: 24px;
  margin-bottom: 5px;
`;

const HighScoreText = styled.div`
  font-size: 18px;
  opacity: 0.8;
`;

interface ScoreProps {
    score: number;
    highScore: number;
}

export const Score: React.FC<ScoreProps> = ({ score, highScore }) => {
    return (
        <ScoreContainer>
            <ScoreText>Score: {score}</ScoreText>
            <HighScoreText>High Score: {highScore}</HighScoreText>
        </ScoreContainer>
    );
}; 