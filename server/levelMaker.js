const Sprite = require('./sprite.js')
const {getRandom, getRandomIntInclusive} = require('../utils')
const {mapList} = require('../datas/mapList')
const Canvas = require('canvas');
global.Image = Canvas.Image;

class LevelMaker {
    constructor(
        orbit,
        level,
        brickWidth,
        brickHeight,
        brickPadding,
        brickOffsetLeft,
        brickOffsetTop,
        brickRowCount,
        brickColumnCount,
    ) {
        this.orbit = orbit
        this.level = level
        this.brickWidth = brickWidth
        this.brickHeight = brickHeight
        this.brickPadding = brickPadding
        this.brickOffsetLeft = brickOffsetLeft
        this.brickOffsetTop = brickOffsetTop
        this.brickRowCount = brickRowCount
        this.brickColumnCount = brickColumnCount
        // select corresponding map
        const datas = Object.entries(mapList[this.orbit])[this.level]
        this.map = datas[1].map
        this.colors = datas[1].colors
        this.status = datas[1].status
    }

    createMap() {
        let bricks = []
        for (let c = 0; c < this.brickColumnCount; c++) {
            bricks[c] = []

            let alternatePattern = getRandom(1)

            const alternateColor1 = getRandomIntInclusive(0, 2)
            const alternateColor2 = getRandomIntInclusive(0, 2)

            for (let r = 0; r < this.brickRowCount; r++) {
                const brickX =
                    c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft
                const brickY =
                    r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop

                let color
                if (alternatePattern) {
                    color = this.colors[alternateColor1]
                    alternatePattern = !alternatePattern
                } else {
                    color = this.colors[alternateColor2]
                    alternatePattern = !alternatePattern
                }

                const pick = String(color).padStart(2, '0')

                const src = './public/assets/' + pick + '.jpg'
                const image = new Image()
                image.src = src

                const sprite = new Sprite({
                    position: {
                        x: brickX,
                        y: brickY,
                    },
                    width: this.brickWidth,
                    height: this.brickHeight,
                    image: image,
                })

                let status = 0

                // set brick if 1 on map
                if (this.map[c][r] === 1) {
                    status = this.status
                }

                // init brick
                bricks[c][r] = {
                    x: brickX,
                    y: brickY,
                    status: status,
                    tier: status,
                    color: color,
                    sprite: sprite,
                }
            }
        }
        return bricks
    }
}

module.exports = LevelMaker
