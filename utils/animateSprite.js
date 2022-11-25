module.exports = (sprite) => {
    if (sprite.frames.max > 1) {
        sprite.frames.elapsed++
    }

    if (sprite.frames.elapsed % sprite.frames.hold === 0) {
        if (sprite.frames.val < sprite.frames.max - 1) sprite.frames.val++
        else sprite.frames.val = 0
    }

    return sprite
}