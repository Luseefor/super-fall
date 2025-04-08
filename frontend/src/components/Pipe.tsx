import React from 'react';
import styled from 'styled-components';

const PipeContainer = styled.div`
  position: absolute;
  width: 60px;
  height: 100%;
  right: 0;
  top: 0;
  z-index: 0;
`;

const PipeSegment = styled.div<{ isUpper?: boolean }>`
  position: absolute;
  width: 60px;
  background-color: #2E8B57;
  right: 0;
  ${props => props.isUpper ? 'top: 0' : 'bottom: 0'};
  border-radius: ${props => props.isUpper ? '4px 4px 0 0' : '0 0 4px 4px'};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

interface PipeProps {
    gapPosition: number;
    gapSize: number;
}

export const Pipe: React.FC<PipeProps> = ({ gapPosition, gapSize }) => {
    return (
        <PipeContainer>
            <PipeSegment isUpper style={{ height: gapPosition }} />
            <PipeSegment style={{ height: window.innerHeight - gapPosition - gapSize }} />
        </PipeContainer>
    );
}; 