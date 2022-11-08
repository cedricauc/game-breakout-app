const Sprite = require('./sprite.js')
const LevelMaker = require('./levelMaker.js')
const Particle = require('./particle.js')
const {getRandomIntFromArray, getRandomInt, getRandom, animateSprite} = require('./utils.js')
const Vector = require("./vector");

const Canvas = require("canvas");
global.Image = Canvas.Image;

class Game {
    constructor(
        level,
        player,
        score,
        lives,
    ) {
        this.level = level
        this.player = player
        this.score = score
        this.lives = lives
        this.paddles = []
        this.balls = []
        this.bricks = []
        this.bonuses = []
        this.particles = []
        this.paddleWidth = 75
        this.paddleHeight = 20
        this.speed = 1.5
        this.timer = 0
        this.hue = 0
        this.win = false
        this.ballRadius = 15
        this.brickWidth = 75
        this.brickHeight = 20
        this.brickPadding = 10
        this.brickOffsetLeft = 25
        this.brickOffsetTop = 30
        this.brickRowCount = 8
        this.brickColumnCount = 8
        this.canvasHeight = 480
        this.canvasWidth = 720
        this.consumable = []
    }

    movePaddle() {
        for (let paddle of this.paddles) {
            paddle.sprite.position = {
                x: this.player.paddleX,
                y: this.player.paddleY
            }
            paddle.sprite.width = this.paddleWidth
            paddle.sprite.height = this.paddleHeight

            if (paddle.sprite.animate)
                paddle.sprite = animateSprite(paddle.sprite)
        }
    }

    collisionDetection() {
        for (let k = 0; k < this.balls.length; k++) {
            let ball = this.balls[k]
            for (let c = 0; c < this.brickColumnCount; c++) {
                for (let r = 0; r < this.brickRowCount; r++) {
                    const brick = this.bricks[c][r]
                    // calculations
                    if (brick.status > 1) {
                        if (
                            ball.x > brick.x &&
                            ball.x < brick.x + this.brickWidth &&
                            ball.y > brick.y &&
                            ball.y < brick.y + this.brickHeight
                        ) {
                            // invert velocity on y axis
                            ball.dy = -ball.dy

                            // update brick status and score
                            this.score += brick.tier
                            brick.status -= 1
                            brick.color += 1

                            // assign gray color for collision greater than 2
                            if(brick.tier === 4 && brick.status === 1) {
                                brick.color = 22
                            }

                            // update sprite
                            const pick = String(brick.color).padStart(2, '0')
                            const src = './public/assets/' + pick + '.png'

                            const image = new Image()
                            image.src = src

                            const sprite = new Sprite({
                                position: {
                                    x: brick.x,
                                    y: brick.y,
                                },
                                width: this.brickWidth,
                                height: this.brickHeight,
                                image: image,
                            })


                            brick.sprite = sprite

                            break
                        }
                    } else if (brick.status === 1) {
                        if (
                            ball.x > brick.x &&
                            ball.x < brick.x + this.brickWidth &&
                            ball.y > brick.y &&
                            ball.y < brick.y + this.brickHeight
                        ) {
                            // invert velocity on y axis
                            ball.dy = -ball.dy
                            // update brick status and score
                            brick.status = 0
                            this.score += brick.tier

                            // randomly init bonus
                            if (getRandom(3)) {
                                this.spawnBonus(brick.x, brick.y)
                            }

                            break
                        }
                    }
                }
            }

            if (
                ball.x + ball.dx > this.canvasWidth - ball.ballRadius ||
                ball.x + ball.dx < ball.ballRadius
            ) {
                // invert velocity on x axis
                ball.dx = -ball.dx
            }
            if (ball.y + ball.dy < ball.ballRadius) {
                // invert velocity on y axis
                ball.dy = -ball.dy
            } else if (ball.y + ball.dy > this.canvasHeight - ball.ballRadius) {
                if (
                    ball.x > this.player.paddleX &&
                    ball.x < this.player.paddleX + this.paddleWidth
                ) {
                    // invert velocity on y axis
                    ball.dy = -ball.dy
                } else {
                    this.balls.splice(k, 1)

                    if (!this.balls.length) {
                        this.lives--

                        if (this.lives) {
                            this.spawnBall(this.player.paddleX, this.player.paddleY)
                        }
                    }
                }
            }

            // update ball position
            ball.x += ball.dx * this.speed
            ball.y += ball.dy * this.speed

            ball.sprite.position.x = ball.x
            ball.sprite.position.y = ball.y
            if (ball.sprite.animate)
                ball.sprite = animateSprite(ball.sprite)
        }
    }

    collisionBonusesDetection() {
        for (let m = 0; m < this.bonuses.length; m++) {
            let bonus = this.bonuses[m]
            if (
                bonus.y + this.brickHeight > this.player.paddleY &&
                bonus.x + this.brickWidth > this.player.paddleX &&
                bonus.x < this.player.paddleX + this.paddleWidth
            ) {
                this.collectBonus(bonus)
                this.bonuses.splice(m, 1)
            } else if (bonus.y + bonus.dy > this.canvasHeight - this.brickHeight) {
                this.bonuses.splice(m, 1)
            }
            bonus.y += bonus.dy

            bonus.sprite.position.y = bonus.y
            if (bonus.sprite.animate)
                bonus.sprite = animateSprite(bonus.sprite)
        }
    }

    spawnPaddle() {
        const src = './public/assets/35.png'
        const image = new Image()
        image.src = src

        const sprite = new Sprite({
            position: {
                x: this.player.paddleX,
                y: this.player.paddleY
            },
            width: 75,
            height: 20,
            image: image,
            animate: true,
            frames: {
                max: 3,
                hold: 2
            }
        })
        this.paddles.push({
            sprite: sprite
        })
    }

    spawnLevel() {
        const level = new LevelMaker(
            this.level - 1,
            this.brickWidth,
            this.brickHeight,
            this.brickPadding,
            this.brickOffsetLeft,
            this.brickOffsetTop,
            this.brickRowCount,
            this.brickColumnCount
        )

        this.bricks = level.createMap()
    }

    spawnBall(x, y) {
        const src = './public/assets/ball.png'
        const image = new Image()
        image.src = src

        const sprite = new Sprite({
            position: {
                x: x + (this.paddleWidth / 2),
                y: y
            },
            width: this.ballRadius,
            height: this.ballRadius,
            image: image,
        })

        this.balls.push({
            ballRadius: this.ballRadius,
            x: x + (this.paddleWidth / 2),
            y: y,
            dx: getRandom(2) ? getRandomInt(3, 2) : getRandomInt(-3, -2),
            dy: -3,
            sprite: sprite
        })
    }

    spawnBonus(x, y) {
        const status = getRandomIntFromArray([40, 41, 42, 43, 44, 45, 50, 100, 250, 500])

        const pick = String(status).padStart(2, '0')
        const src = './public/assets/' + pick + '.png'
        const image = new Image()
        image.src = src

        const sprite = new Sprite({
            position: {
                x: x,
                y: y
            },
            width: this.brickWidth,
            height: this.brickHeight,
            image: image,
            animate: true,
            frames: {
                max: 3,
                hold: 20
            }
        })

        this.bonuses.push({
            x: x,
            y: y,
            dx: 0,
            dy: 3,
            status: status,
            sprite: sprite,
            consumable: false,
            lifespan: 0
        })
    }

    calculateWin() {
        let win = true
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                const brick = this.bricks[c][r]
                if (brick.status !== 0) {
                    win = false
                }
            }
        }
        this.win = win
    }

    collectBonus(bonus) {
        switch (bonus.status) {
            case 40:
                this.spawnBall(this.player.paddleX, this.player.paddleY)
                break
            case 41:
                this.lives++
                break
            case 42:
                this.speed = this.speed > 1 ? this.speed - 0.4 : 1
                break
            case 43:
                this.speed = this.speed < 2.2 ? this.speed + 0.4 : 2.2
                break
            case 44:
                this.paddleWidth = this.paddleWidth > 45 ? this.paddleWidth - 30 : 45
                bonus.consumable = true
                bonus.lifespan = this.timer + 5
                break
            case 45:
                this.paddleWidth = this.paddleWidth < 105 ? this.paddleWidth + 30 : 105
                bonus.consumable = true
                bonus.lifespan = this.timer + 5
                break
            case 50:
                this.score += 50
                break
            case 100:
                this.score += 100
                break
            case 250:
                this.score += 250
                break
            case 500:
                this.score += 500
                break
            default:
                break
        }

        if(bonus.consumable) {
            this.consumable.push({
                status: bonus.status,
                lifespan: bonus.lifespan
            })
        }
    }

    initParticles() {
        this.particles = [];

        let numberOfParticles = this.canvasWidth * this.canvasHeight / 1500;
        for (let i = 0; i < numberOfParticles; i++) {
            let particle = new Particle(Math.random() * this.canvasWidth,
                Math.random() * this.canvasHeight,
                this.canvasWidth,
                this.canvasHeight);
            this.particles.push(particle);
        }
    }

    moveParticles() {
        let size = 15
        let columns = Math.round(this.canvasWidth / size) + 1;
        let rows = Math.round(this.canvasHeight / size) + 1;
        let field = new Array(columns);
        for (let x = 0; x < columns; x++) {
            field[x] = new Array(columns);
            for (let y = 0; y < rows; y++) {
                let v = new Vector(0, 0);
                field[x][y] = v;
            }
        }

        this.particles.forEach(p => {
            let pos = p.pos.div(size);
            let v;
            if (pos.x >= 0 && pos.x < columns && pos.y >= 0 && pos.y < rows) {
                v = field[Math.floor(pos.x)][Math.floor(pos.y)];
            }
            p.move(v);
            p.wrap();
        });

        this.hue = this.hue < 255 ? this.hue + 0.5 : 0
    }

    spawnTimer(reset) {
        if (reset)
            this.timer = 0
        this.timer = this.timer + 0.01
    }

    checkConsumable() {
        for (let v = 0; v < this.consumable.length; v++) {
            let consumable = this.consumable[v]
            if(this.timer > consumable.lifespan) {
                switch(consumable.status) {
                    case 44:
                    case 45:
                        this.paddleWidth = 75
                        break
                }
                this.consumable.splice(v, 1)
            }
        }
    }

}

module.exports = Game
