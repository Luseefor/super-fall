import Matter from 'matter-js';

interface GameEngineProps {
    onGameOver: () => void;
    onScore: () => void;
}

export class GameEngine {
    private engine: Matter.Engine;
    private render: Matter.Render;
    private bird: Matter.Body;
    private pipes: Matter.Body[];
    private ground: Matter.Body;
    private ceiling: Matter.Body;
    private score: number;
    private isGameOver: boolean;
    private props: GameEngineProps;

    constructor(props: GameEngineProps) {
        this.props = props;
        this.score = 0;
        this.isGameOver = false;
        this.pipes = [];

        // Create Matter.js engine
        this.engine = Matter.Engine.create();
        this.engine.world.gravity.y = 0.8;

        // Create renderer
        this.render = Matter.Render.create({
            element: document.body,
            engine: this.engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: '#87CEEB'
            }
        });

        // Create bird
        this.bird = Matter.Bodies.circle(
            window.innerWidth / 4,
            window.innerHeight / 2,
            20,
            {
                render: { fillStyle: '#FFD700' },
                friction: 0.1,
                restitution: 0.6,
                label: 'bird'
            }
        );

        // Create ground and ceiling
        this.ground = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            window.innerHeight + 30,
            window.innerWidth,
            60,
            { isStatic: true, render: { fillStyle: '#2E8B57' } }
        );

        this.ceiling = Matter.Bodies.rectangle(
            window.innerWidth / 2,
            -30,
            window.innerWidth,
            60,
            { isStatic: true, render: { fillStyle: '#2E8B57' } }
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
    }

    public start = () => {
        this.score = 0;
        this.isGameOver = false;
        Matter.Body.setPosition(this.bird, {
            x: window.innerWidth / 4,
            y: window.innerHeight / 2
        });
        Matter.Body.setVelocity(this.bird, { x: 0, y: 0 });
        this.createPipe();
        this.startPipeGeneration();
    };

    public flap = () => {
        if (!this.isGameOver) {
            Matter.Body.setVelocity(this.bird, { x: 0, y: -8 });
        }
    };

    private createPipe = () => {
        const gap = 200;
        const gapPosition = Math.random() * (window.innerHeight - gap - 200) + 100;
        const pipeWidth = 60;

        const upperPipe = Matter.Bodies.rectangle(
            window.innerWidth + pipeWidth,
            gapPosition / 2,
            pipeWidth,
            gapPosition,
            { isStatic: true, render: { fillStyle: '#2E8B57' }, label: 'pipe' }
        );

        const lowerPipe = Matter.Bodies.rectangle(
            window.innerWidth + pipeWidth,
            gapPosition + gap + (window.innerHeight - gapPosition - gap) / 2,
            pipeWidth,
            window.innerHeight - gapPosition - gap,
            { isStatic: true, render: { fillStyle: '#2E8B57' }, label: 'pipe' }
        );

        Matter.World.add(this.engine.world, [upperPipe, lowerPipe]);
        this.pipes.push(upperPipe, lowerPipe);
    };

    private startPipeGeneration = () => {
        setInterval(() => {
            if (!this.isGameOver) {
                this.createPipe();
            }
        }, 2000);
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
} 