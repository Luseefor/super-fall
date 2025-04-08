import React, { useEffect } from 'react';
import styled from 'styled-components';
import logoImage from '../assets/images/logo.png';

const SplashContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #87CEEB, #E0F6FF);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  overflow: hidden;
`;

const LogoContainer = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: zoomIn 1.5s ease-out forwards;
  transform: scale(0.1);
  opacity: 0;

  @keyframes zoomIn {
    0% {
      transform: scale(0.1);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const StartText = styled.div`
  position: absolute;
  bottom: 10%;
  font-size: 32px;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: fadeInOut 2s infinite;
  z-index: 1;
  font-weight: bold;
  letter-spacing: 2px;

  @keyframes fadeInOut {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }
`;

interface SplashScreenProps {
    onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault();
                onStart();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [onStart]);

    return (
        <SplashContainer onClick={onStart}>
            <LogoContainer>
                <Logo src={logoImage} alt="Flappy Bird Logo" />
            </LogoContainer>
            <StartText>PRESS SPACE TO START</StartText>
        </SplashContainer>
    );
}; 