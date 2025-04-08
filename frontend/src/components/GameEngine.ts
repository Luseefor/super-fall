import Matter from 'matter-js';

interface GameEngineProps {
    onGameOver: () => void;
    onScore: () => void;
}

export class GameEngine {
    private engine!: Matter.Engine;
    private render!: Matter.Render;
    private bird!: Matter.Body;
    private pipes: Matter.Body[];
    private ground!: Matter.Body;
    private ceiling!: Matter.Body;
    private score: number;
    private isGameOver: boolean;
    private props: GameEngineProps;
    private readonly pipeWidth: number = 60;

    constructor(props: GameEngineProps) {
        this.props = props;
        this.score = 0;
        this.isGameOver = false;
        this.pipes = [];

        console.log('Initializing game engine...');

        // Create Matter.js engine
        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0.5;

        // Create renderer
        const canvasElement = document.querySelector('.game-canvas') as HTMLElement;
        if (!canvasElement) {
            console.error('Game canvas element not found!');
            return;
        }

        this.render = Matter.Render.create({
            element: canvasElement,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'transparent'
            }
        });

        // Create bird
        this.bird = Matter.Bodies.circle(
            window.innerWidth / 4,
            window.innerHeight / 2,
            20,
            {
                render: {
                    fillStyle: '#FFD700',
                    visible: true
                },
                friction: 0.1,
                restitution: 0.6,
                density: 0.001,
                label: 'bird',
                inertia: Infinity,
                frictionAir: 0.001
            }
        );

        // Create ground and ceiling
        this.ground = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight + 30,
            window.innerWidth,
            60,
            {
                isStatic: true,
                render: {
                    fillStyle: '#2E8B57',
                    visible: false
                }
            }
        );

        this.ceiling = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            -30,
            window.innerWidth,
            60,
            {
                isStatic: true,
                render: {
                    fillStyle: '#2E8B57',
                    visible: false
                }
            }
        );

        // Add all bodies to the world
        Matter.World.add(this.engine.world, [this.bird, this.ground, this.ceiling]);

        // Add collision detection
        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                if (
                    (pair.bodyA.label === 'bird' && pair.bodyB.label === 'pipe') ||
                    (pair.bodyA.label === 'pipe' && pair.bodyB.label === 'bird')
                ) {
                    this.gameOver();
                }
            });
        });

        // Start the engine and renderer
        Matter.Runner.run(this.engine);
        Matter.Render.run(this.render);
        console.log('Game engine initialized and running');
    }

    public start = () => {
        console.log('Starting game...');
        this.score = 0;
        this.isGameOver = false;

        // Clear existing pipes
        this.pipes.forEach(pipe => {
            Matter.World.remove(this.engine.world, pipe);
        });
        this.pipes = [];

        // Reset bird position and velocity
        Matter.Body.setPosition(this.bird, {
            x: window.innerWidth / 4,
            y: window.innerHeight / 2
        });
        Matter.Body.setVelocity(this.bird, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(this.bird, 0);

        // Ensure engine is running
        Matter.Runner.run(this.engine);
        Matter.Render.run(this.render);
        console.log('Game started, bird position:', this.bird.position);

        this.startPipeGeneration();
    };

    public flap = () => {
        if (!this.isGameOver) {
            console.log('Flapping! Current velocity:', this.bird.velocity);
            Matter.Body.setVelocity(this.bird, { x: 0, y: -10 });
            console.log('New velocity:', this.bird.velocity);
        }
    };

    private createPipe = () => {
        const gap = 150;
        const gapPosition = Math.random() * (window.innerHeight - gap - 200) + 100;

        const upperPipe = Matter.Bodies.rectangle(
            window.innerWidth + this.pipeWidth,
            gapPosition / 2,
            this.pipeWidth,
            gapPosition,
            {
                isStatic: true,
                render: {
                    fillStyle: '#2E8B57',
                    visible: false
                },
                label: 'pipe'
            }
        );

        const lowerPipe = Matter.Bodies.rectangle(
            window.innerWidth + this.pipeWidth,
            gapPosition + gap + (window.innerHeight - gapPosition - gap) / 2,
            this.pipeWidth,
            window.innerHeight - gapPosition - gap,
            {
                isStatic: true,
                render: {
                    fillStyle: '#2E8B57',
                    visible: false
                },
                label: 'pipe'
            }
        );

        Matter.World.add(this.engine.world, [upperPipe, lowerPipe]);
        this.pipes.push(upperPipe, lowerPipe);
    };

    private startPipeGeneration = () => {
        // Create initial pipes
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.createPipe();
            }, i * 1500);
        }

        // Move pipes continuously
        Matter.Events.on(this.engine, 'beforeUpdate', () => {
            if (this.isGameOver) return;

            this.pipes.forEach((pipe, index) => {
                Matter.Body.translate(pipe, { x: -2, y: 0 });

                // Remove pipes that are off screen
                if (pipe.position.x < -this.pipeWidth) {
                    Matter.World.remove(this.engine.world, pipe);
                    this.pipes.splice(index, 1);
                    this.props.onScore();
                }
            });
        });

        // Generate new pipes
        setInterval(() => {
            if (!this.isGameOver) {
                this.createPipe();
            }
        }, 1500);
    };

    private gameOver = () => {
        this.isGameOver = true;
        this.props.onGameOver();
    };

    public cleanup = () => {
        Matter.Render.stop(this.render);
        Matter.Engine.clear(this.engine);
        this.render.canvas.remove();
    };

    public getBird = () => {
        return this.bird;
    };
} 