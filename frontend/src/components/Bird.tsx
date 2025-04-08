import React from 'react';
import styled from 'styled-components';

const BirdSprite = styled.div`
  width: 40px;
  height: 40px;
  background-color: #FFD700;
  border-radius: 50%;
  position: absolute;
  left: 25%;
  top: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background-color: #000;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 8px;
    background-color: #FFA500;
    border-radius: 4px;
    top: 60%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const Bird: React.FC = () => {
    return <BirdSprite />;
}; 