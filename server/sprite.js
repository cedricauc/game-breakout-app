class Sprite {
    constructor({
                    position,
                    velocity,
                    src,
                    frames = { max: 1, hold: 10 },
                    sprites,
                    animate = false,
                    rotation = 0,
                    scale,
                    width,
                    height
                }) {
        this.position = position
        this.frames = { ...frames, val: 0, elapsed: 0 }
        this.src = src

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