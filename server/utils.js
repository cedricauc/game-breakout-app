module.exports = {
    getRandomIntFromArray(array) {
        return array[Math.floor(Math.random() * array.length)]
    },

    getRandomInt(min, max) {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
    },

    getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
    },

    getRandom(val) {
        return Math.floor(Math.random() * val) === 0
    },

    animateSprite(sprite) {
        if (sprite.frames.max > 1) {
            sprite.frames.elapsed++
        }

        if (sprite.frames.elapsed % sprite.frames.hold === 0) {
            if (sprite.frames.val < sprite.frames.max - 1) sprite.frames.val++
            else sprite.frames.val = 0
        }

        return sprite
    }
}

