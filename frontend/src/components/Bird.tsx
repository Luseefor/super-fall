import React from 'react';
import styled from 'styled-components';
import birdImage from '../assets/images/bird.png';

const BirdSprite = styled.div<{ x: number; y: number }>`
  width: 40px;
  height: 40px;
  position: absolute;
  left: ${props => props.x}px;
  top: ${props => props.y}px;
  transform: translate(-50%, -50%);
  z-index: 1;
  background-image: url(${birdImage});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
`;

interface BirdProps {
    position: {
        x: number;
        y: number;
    };
}

export const Bird: React.FC<BirdProps> = ({ position }) => {
    return <BirdSprite x={position.x} y={position.y} />;
}; 