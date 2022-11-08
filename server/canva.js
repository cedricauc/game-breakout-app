const { createCanvas } = require('canvas')

class Canva {
    constructor(
    ) {
        this.brickRowCount = 8
        this.brickColumnCount = 8

        this.canvas = createCanvas(720, 480)
        this.ctx = this.canvas.getContext('2d')
    }

    drawSprite(sprite) {
        this.ctx.save()
        this.ctx.translate(
            sprite.position.x + sprite.width / 2,
            sprite.position.y + sprite.height / 2,
        )
        this.ctx.rotate(sprite.rotation)
        this.ctx.translate(
            -sprite.position.x - sprite.width / 2,
            -sprite.position.y - sprite.height / 2,
        )
        this.ctx.globalAlpha = sprite.opacity

        this.ctx.scale(sprite.scale, sprite.scale)

        this.ctx.drawImage(
            sprite.image,
            sprite.frames.val * (sprite.image.width / sprite.frames.max),
            0,
            sprite.image.width / sprite.frames.max,
            sprite.image.height,
            sprite.position.x,
            sprite.position.y,
            sprite.width,
            sprite.height,
        )
        this.ctx.restore()
    }

    drawParticles(particles, hue) {
        this.ctx.fillStyle = `hsla(${hue}, 50%, 50%, 1)`
        particles.forEach((p) => {
            this.ctx.fillRect(p.pos.x, p.pos.y, p.size, p.size)
        })
    }

    drawBalls(balls) {
        balls.forEach((ball) => {
            this.drawSprite(ball.sprite)
        })
    }

    drawPaddle(paddles) {
        paddles.forEach((paddle) => {
            this.drawSprite(paddle.sprite)
        })
    }

    drawBricks(bricks) {
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (bricks[c][r].status > 0) {
                    this.drawSprite(bricks[c][r].sprite)
                }
            }
        }
    }

    drawBonuses(bonuses) {
        bonuses.forEach((bonus) => {
            this.drawSprite(bonus.sprite)
        })
    }

    draw(particles, balls, paddles, bricks, bonuses, hue) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.drawParticles(particles, hue)
        this.drawBricks(bricks)
        this.drawBalls(balls)
        this.drawPaddle(paddles)
        this.drawBonuses(bonuses)
    }
}

module.exports = Canva