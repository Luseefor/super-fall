import React from 'react';
import styled from 'styled-components';

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Logo = styled.img`
  width: 200px;
  height: auto;
  animation: bounce 1s infinite;
  margin-bottom: 20px;

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }
`;

const StartText = styled.div`
  font-size: 24px;
  color: #333;
  margin-top: 20px;
  animation: fadeInOut 2s infinite;

  @keyframes fadeInOut {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

interface SplashScreenProps {
    onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    return (
        <SplashContainer onClick={onStart}>
            <Logo src="/src/assets/images/logo.png" alt="Flappy Bird Logo" />
            <StartText>Click or Press Space to Start</StartText>
        </SplashContainer>
    );
}; 