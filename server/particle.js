const Vector = require("./vector");

class Particle {
    constructor(x, y, w, h) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5);
        this.acc = new Vector(0, 0);
        this.size = 1;
        this.w = w
        this.h = h
    }

    move(acc) {
        if(acc) {
            this.acc.addTo(acc);
        }
        this.vel.addTo(this.acc);
        this.pos.addTo(this.vel);
        if(this.vel.getLength() > 1) {
            this.vel.setLength(1);
        }
        this.acc.setLength(0);
    }

    wrap() {
        if(this.pos.x > this.w) {
            this.pos.x = 0;
        } else if(this.pos.x < -this.size) {
            this.pos.x = this.w - 1;
        }
        if(this.pos.y > this.h) {
            this.pos.y = 0;
        } else if(this.pos.y < -this.size) {
            this.pos.y = this.h - 1;
        }
    }
}

module.exports = Particle
