const Canvas = require("canvas");
global.Image = Canvas.Image;

class Sprite {
    constructor({
                    position,
                    velocity,
                    image,
                    frames = { max: 1, hold: 10 },
                    sprites,
                    animate = false,
                    rotation = 0,
                    scale,
                    width,
                    height,
                }) {
        this.position = position
        this.frames = {...frames, val: 0, elapsed: 0}

        this.image = image
        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height
        }

        this.animate = animate
        this.sprites = sprites
        this.opacity = 1

        this.rotation = rotation

        this.scale = scale

        this.width = width
        this.height = height
    }

}

module.exports = Sprite