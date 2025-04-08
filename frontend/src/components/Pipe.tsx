import React from 'react';
import styled from 'styled-components';
import pipeImage from '../assets/images/pipe.png';

const PipeContainer = styled.div`
  position: absolute;
  width: 60px;
  height: 100vh;
  right: 0;
  top: 0;
  z-index: 0;
`;

const PipeSegment = styled.div<{ $isUpper?: boolean; height: number }>`
  position: absolute;
  width: 60px;
  right: 0;
  height: ${props => props.height}px;
  ${props => props.$isUpper ? 'top: 0' : 'bottom: 0'};
  background-image: url(${pipeImage});
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  image-rendering: pixelated;
  transform: ${props => props.$isUpper ? 'rotate(180deg)' : 'none'};
`;

interface PipeProps {
    gapPosition: number;
    gapSize: number;
}

export const Pipe: React.FC<PipeProps> = ({ gapPosition, gapSize }) => {
    return (
        <PipeContainer>
            <PipeSegment $isUpper height={gapPosition} />
            <PipeSegment height={window.innerHeight - gapPosition - gapSize} />
        </PipeContainer>
    );
}; 