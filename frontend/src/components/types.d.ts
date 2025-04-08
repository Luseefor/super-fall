declare module './GameEngine' {
    export class GameEngine {
        constructor(props: { onGameOver: () => void; onScore: () => void });
        start(): void;
        flap(): void;
        cleanup(): void;
    }
}

declare module './Bird' {
    export const Bird: React.FC;
}

declare module './Pipe' {
    export const Pipe: React.FC<{ gapPosition: number; gapSize: number }>;
}

declare module './Score' {
    export const Score: React.FC<{ score: number; highScore: number }>;
} 