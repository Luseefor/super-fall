import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface BirdProps {
    position: {
        x: number;
        y: number;
        rotation: number;
    };
}

const BirdContainer = styled.div`
    position: absolute;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
    transform-origin: center;
    pointer-events: none;
`;

const BirdImage = styled.img`
    width: 100%;
    height: 100%;
    object-fit: contain;
`;

export const Bird: React.FC<BirdProps> = ({ position }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = '/src/assets/images/bird.png';
        img.onload = () => setImageLoaded(true);
    }, []);

    if (!imageLoaded) {
        return null;
    }

    return (
        <BirdContainer
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: `translate(-50%, -50%) rotate(${position.rotation}deg)`
            }}
        >
            <BirdImage src="/src/assets/images/bird.png" alt="bird" />
        </BirdContainer>
    );
}; 