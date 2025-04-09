import birdImage from '../assets/images/bird.png';
import pipeImage from '../assets/images/pipe.png';

interface GameEngineProps {
    onGameOver: () => void;
    onScore: () => void;
}

export class GameEngine {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private bird: {
        x: number;
        y: number;
        velocity: number;
        rotation: number;
        width: number;
        height: number;
    };
    private pipes: Array<{
        x: number;
        gapY: number;
        gapHeight: number;
        scored: boolean;
    }>;
    private score: number;
    private isGameOver: boolean;
    private hasStartedPlaying: boolean = false;
    private props: GameEngineProps;
    private readonly pipeWidth: number = 80;
    private readonly pipeGap: number = 200;
    private readonly pipeSpacing: number = 300; // Horizontal space between pipes
    private animationFrameId: number = 0;
    private birdImage: HTMLImageElement;
    private pipeImage: HTMLImageElement;
    private pipeGenerationInterval: number | null = null;
    private lastFrameTime: number = 0;
    private readonly targetFPS: number = 60;
    private readonly frameInterval: number = 1000 / this.targetFPS;

    constructor(props: GameEngineProps) {
        this.props = props;
        this.score = 0;
        this.isGameOver = false;
        this.pipes = [];

        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        document.body.appendChild(this.canvas);

        // Get context
        const context = this.canvas.getContext('2d');
        if (!context) throw new Error('Could not get canvas context');
        this.ctx = context;

        // Load images
        this.birdImage = new Image();
        this.birdImage.src = birdImage;

        this.pipeImage = new Image();
        this.pipeImage.src = pipeImage;

        // Initialize bird
        this.bird = {
            x: window.innerWidth / 4,
            y: window.innerHeight / 2,
            velocity: 0,
            rotation: 0,
            width: 40,
            height: 30
        };

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
        this.resizeCanvas();

        // Start game loop
        this.gameLoop();
    }

    private resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    private gameLoop = () => {
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastFrameTime;

        if (elapsed > this.frameInterval) {
            if (!this.isGameOver) {
                this.update();
            }
            this.draw();
            this.lastFrameTime = currentTime - (elapsed % this.frameInterval);
        }

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    };

    private update() {
        // Only apply gravity and update bird position if game has actually started
        if (this.hasStartedPlaying) {
            // Apply gravity with frame rate independence
            this.bird.velocity += 0.5 * (this.frameInterval / 16.67); // Normalize to 60fps
            this.bird.y += this.bird.velocity;
            this.bird.rotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 2, this.bird.rotation + this.bird.velocity * 0.1));

            // Update pipes only when game has started
            for (let i = this.pipes.length - 1; i >= 0; i--) {
                const pipe = this.pipes[i];
                pipe.x -= 2 * (this.frameInterval / 16.67); // Normalize to 60fps

                // Check if bird has passed the pipe for scoring
                if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                    pipe.scored = true;
                    this.score++;
                    this.props.onScore();
                }

                // Remove pipes that are off screen
                if (pipe.x < -this.pipeWidth) {
                    this.pipes.splice(i, 1);
                }
            }
        }

        // Check collisions only if game has started
        if (this.hasStartedPlaying) {
            this.checkCollisions();
        }
    }

    private ensurePipes() {
        const lastPipe = this.pipes[this.pipes.length - 1];
        if (!lastPipe || lastPipe.x <= this.canvas.width - this.pipeSpacing) {
            this.createPipe();
        }
    }

    private checkCollisions() {
        // Ground and ceiling collisions
        if (this.bird.y + this.bird.height > this.canvas.height || this.bird.y < 0) {
            this.gameOver();
            return;
        }

        // Pipe collisions
        for (const pipe of this.pipes) {
            if (this.bird.x + this.bird.width > pipe.x && this.bird.x < pipe.x + this.pipeWidth) {
                // Check collision with upper pipe (only the visible part)
                const upperPipeHeight = pipe.gapY;
                if (this.bird.y < upperPipeHeight) {
                    this.gameOver();
                    return;
                }

                // Check collision with lower pipe (only the visible part)
                const lowerPipeStart = pipe.gapY + pipe.gapHeight;
                if (this.bird.y + this.bird.height > lowerPipeStart) {
                    this.gameOver();
                    return;
                }
            }
        }
    }

    private draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw pipes
        this.pipes.forEach(pipe => {
            // Upper pipe (flipped)
            this.ctx.save();
            this.ctx.translate(pipe.x + this.pipeWidth / 2, pipe.gapY);
            this.ctx.scale(1, -1);
            this.ctx.drawImage(
                this.pipeImage,
                -this.pipeWidth / 2,
                0,
                this.pipeWidth,
                pipe.gapY
            );
            this.ctx.restore();

            // Lower pipe
            this.ctx.drawImage(
                this.pipeImage,
                pipe.x,
                pipe.gapY + pipe.gapHeight,
                this.pipeWidth,
                this.canvas.height - (pipe.gapY + pipe.gapHeight)
            );
        });

        // Draw bird
        this.ctx.save();
        this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
        this.ctx.rotate(this.bird.rotation);
        this.ctx.drawImage(
            this.birdImage,
            -this.bird.width / 2,
            -this.bird.height / 2,
            this.bird.width,
            this.bird.height
        );
        this.ctx.restore();
    }

    public start() {
        this.score = 0;
        this.isGameOver = false;
        this.hasStartedPlaying = false;
        this.pipes = [];
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.bird.rotation = 0;
        // Create initial pipe immediately
        this.createPipe();
        console.log('Game started, initial pipe created');
    }

    public flap() {
        if (!this.isGameOver) {
            this.hasStartedPlaying = true;
            this.bird.velocity = -8;
            this.bird.rotation = -Math.PI / 4;
            // Start pipe generation when first flap occurs
            this.startPipeGeneration();
            console.log('First flap, starting pipe generation');
        }
    }

    private startPipeGeneration() {
        // Clear any existing interval
        if (this.pipeGenerationInterval) {
            clearInterval(this.pipeGenerationInterval);
            console.log('Cleared existing pipe generation interval');
        }

        // Create initial pipe
        this.createPipe();

        // Set up interval for continuous pipe generation
        this.pipeGenerationInterval = window.setInterval(() => {
            if (!this.isGameOver && this.hasStartedPlaying) {
                this.createPipe();
            }
        }, 2000); // Generate new pipe every 2 seconds
        console.log('Started pipe generation interval');
    }

    private createPipe() {
        // Only create a new pipe if there's enough space from the last pipe
        const lastPipe = this.pipes[this.pipes.length - 1];
        if (!lastPipe || lastPipe.x <= this.canvas.width - this.pipeSpacing) {
            const gapY = Math.random() * (this.canvas.height - this.pipeGap - 200) + 100;
            const newPipe = {
                x: this.canvas.width,
                gapY,
                gapHeight: this.pipeGap,
                scored: false
            };
            this.pipes.push(newPipe);
            console.log('Created new pipe:', newPipe);
        }
    }

    private gameOver() {
        this.isGameOver = true;
        this.props.onGameOver();
    }

    public cleanup() {
        cancelAnimationFrame(this.animationFrameId);
        this.canvas.remove();
    }

    public getBird() {
        return this.bird;
    }
} 