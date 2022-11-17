const express = require('express')
const cookieParser = require("cookie-parser");
const session = require('express-session')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash')
const passport = require('passport')
const mongoose = require('mongoose')
const db = require('./config/data').mongoURI
const secret = require('./config/data').secret
const helmet = require('helmet')
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000

const routes = require('./routes/index')
const users = require('./routes/users')

const User = require("./models/User");

const Game = require('./server/game.js')
const Canva = require('./server/canva.js')

const orbitList = require('./datas/orbitList')

//Init app
const app = express()

//Security HTTP Headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    }),
)

// DB
mongoose
    .connect(db, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.log(err))

// View engine
app.set('view engine', 'ejs')
app.use(expressLayouts)

// express bodyParser
app.use(express.json())
app.use(express.urlencoded({extended: true}))

//Bootsrap css
app.use(
    '/bootstrap/css',
    express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')),
)

//Bootsrap js
app.use(
    '/bootstrap/js',
    express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')),
)

//jQuery
app.use(
    '/jquery',
    express.static(path.join(__dirname, 'node_modules/jquery/dist')),
)
// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.static('public'))

const oneDay = 1000 * 60 * 60 * 24;

const sessionMiddleware = session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
});

// Express session
app.use(sessionMiddleware)
// Node.js body parsing middleware
app.use(bodyParser.urlencoded({extended: false}));
// Middle-ware that initialises Passport
app.use(passport.initialize())
app.use(passport.session())

// cookie parser middleware
app.use(cookieParser());

// Connect flash
app.use(flash())
// Global variables
app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

//App routes
app.use('/', routes)
app.use('/users', users)

//Init socket.io
const server = app.listen(PORT)

const {instrument} = require("@socket.io/admin-ui");
const {Socket} = require("socket.io")
const io = require("socket.io")(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
    }
})

instrument(io, {
    auth: false
});

// convert a connect middleware to a Socket.IO middleware
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);

// middleware function with passport
io.use(wrap(sessionMiddleware));
io.use(wrap(passport.initialize()));
io.use(wrap(passport.session()));

io.use((socket, next) => {
    if (socket.request.user) {
        next();
    } else {
        next(new Error('unauthorized'))
    }
});

//Socket.io rooms
let rooms = []

//Node.js canvas
let canva

/**
 * @type {Socket}
 */
io.on('connection', (socket) => {
    //console.log(`[connection] ${socket.id}`)

    // set socket.io session
    const session = socket.request.session;
    //console.log(`saving sid ${socket.id} in session ${session.id}`);
    session.socketId = socket.id;
    session.save();

    const date = new Date().toDateString()

    socket.on('playerData', async (player) => {
        const filter = {email: socket.request.user.username};
        const update = {freeGameDate: date, gamesNbr: socket.request.user.gamesNbr};
        // update user freeGameDate to db
        const currentUser = await User.findOneAndUpdate(filter, update, {new: true});

        socket.request.flag = false
        socket.request.user.gamesNbr = currentUser.gamesNbr
        socket.request.user.freeGameDate = currentUser.freeGameDate
        socket.request.user.freeGameDateUsed = currentUser.freeGameDateUsed
        socket.request.user.orbits = currentUser.orbits

        let room = null

        if (!player.roomId) {
            room = createRoom(
                player,
                socket.request.user.currentOrbit,
                socket.request.user.level,
                socket.request.user.lives
            )
            //console.log(`[create room] - ${room.id} - ${player.username}`)
        } else {
            room = rooms.find((r) => r.id === player.roomId)

            if (room === undefined) {
                return
            }

            player.roomId = room.id
            room.players.push(player)
        }

        socket.join(room.id)

        io.to(socket.id).emit('join room', room.id)

        // init paddle
        room.game.spawnPaddle()
        // init level
        room.game.spawnLevel()
        // init background particles
        //room.game.initParticles()
        // init ball
        room.game.spawnBall(player.paddleX, player.paddleY)
        // init canvas
        canva = new Canva()

        canva.draw(
            room.game.particles,
            room.game.balls,
            room.game.paddles,
            room.game.bricks,
            room.game.bonuses,
            room.game.hue)

        io.to(room.id).emit('play',
            room.game.score,
            room.game.lives,
            room.game.level,
            room.game.timer,
            room.game.win,
            //canva.canvas.toBuffer('image/png', {compressionLevel: 0, filters: canva.canvas.PNG_FILTER_NONE})
            canva.canvas.toDataURL('image/jpeg', {quality: 0.3})
        )
    })

    socket.on('collision detection', async (player) => {
        const room = rooms.find((r) => r.id === player.roomId)
        //console.log(`[collision detection] - ${player.id} - ${player.username}`)
        if (room === undefined) {
            return
        }

        room.game.player = {
            paddleX: player.paddleX,
            paddleY: player.paddleY,
        }

        // update timer
        room.game.spawnTimer()
        // update paddle position
        room.game.movePaddle()
        // update background particles
        //room.game.moveParticles()
        // check for collision (balls, paddles, bricks)
        room.game.collisionDetection()
        // check for collision (paddles, bonuses)
        room.game.collisionBonusesDetection()
        // check if a winner
        room.game.calculateWin()
        // check for bonus lifespan
        room.game.checkConsumable()

        canva.draw(
            room.game.particles,
            room.game.balls,
            room.game.paddles,
            room.game.bricks,
            room.game.bonuses,
            room.game.hue)

        const buffer = canva.canvas.toDataURL('image/jpeg', {quality: 0.3})

        io.to(player.roomId).emit('play',
            room.game.score,
            room.game.lives,
            room.game.level,
            room.game.timer,
            room.game.win,
            //canva.canvas.toBuffer('image/png', {compressionLevel: 0, filters: canva.canvas.PNG_FILTER_NONE})
            buffer
        )
    })

    socket.on('game win', async (player) => {
        // console.log(`[game win] - ${player.id} - ${player.username}`)
        const room = rooms.find((r) => r.id === player.roomId)
        if (room === undefined) {
            return
        }

        const maxLevel = orbitList.orbits.find(v => v.planet === socket.request.user.currentOrbit).levelNbr

        const currentOrbit = socket.request.user.orbits.find(v => v.planet == socket.request.user.currentOrbit)

        let completeLevel = currentOrbit.completeLevel
        // check if orbit has next level
        let level = room.game.level
        if (room.game.level < maxLevel) {
            level = room.game.level + 1
        }
        if (level === maxLevel) {
            completeLevel = true
        }

        const bestScore = room.game.score > socket.request.user.bestScore ? room.game.score : socket.request.user.bestScore;
        const filter = {email: socket.request.user.username, "orbits.planet": socket.request.user.currentOrbit};
        const update = {
            lastScore: socket.request.user.lastScore + room.game.score,
            timePlay: parseInt(socket.request.user.timePlay) + Math.ceil(room.game.timer),
            $set: {
                "orbits.$.userLevel": level,
                "orbits.$.bestScore": bestScore,
                "orbits.$.completeLevel": completeLevel
            },
        };
        // update db
        const currentUser = await User.findOneAndUpdate(filter, update, {new: true});

        socket.request.user.bestScore = bestScore
        socket.request.user.orbits = currentUser.orbits

        io.to(room.id).emit('play again waiting area', socket.request.user.gamesNbr)
    })

    socket.on('game over', async (player) => {
        //console.log(`[game over] - ${player.username}`)
        const room = rooms.find((r) => r.id === player.roomId)
        if (room === undefined) {
            return
        }

        const bestScore = room.game.score > socket.request.user.bestScore ? room.game.score : socket.request.user.bestScore;
        socket.request.user.bestScore = bestScore

        const filter = {email: socket.request.user.username, "orbits.planet": socket.request.user.currentOrbit};

        // if free game is used
        if (socket.request.user.freeGameDateUsed === socket.request.user.freeGameDate) {
            const gamesNbr = socket.request.user.gamesNbr - 1
            socket.request.user.gamesNbr = gamesNbr

            const update = {
                lastScore: socket.request.user.lastScore + room.game.score,
                timePlay: parseInt(socket.request.user.timePlay) + Math.ceil(room.game.timer),
                gamesNbr: gamesNbr,
                $set: {"orbits.$.bestScore": bestScore}
            };

            // update db
            await User.findOneAndUpdate(filter, update, {new: true});
        } else {
            const update = {
                lastScore: socket.request.user.lastScore + room.game.score,
                freeGameDateUsed: date,
                timePlay: parseInt(socket.request.user.timePlay) + Math.ceil(room.game.timer),
                $set: {"orbits.$.bestScore": bestScore}
            }

            // update db
            const currentUser = await User.findOneAndUpdate(filter, update, {new: true});
            socket.request.user.freeGameDateUsed = currentUser.freeGameDateUsed
            socket.request.user.orbits = currentUser.orbits
        }

        io.to(room.id).emit('play again waiting area', socket.request.user.gamesNbr)
    })

    socket.on('play again', async (player) => {
        const room = rooms.find((r) => r.id === player.roomId)
        if (room === undefined) {
            return
        }

        if (socket.request.user.gamesNbr < 1) {
            io.to(room.id).emit('play again waiting area', socket.request.user.gamesNbr)
        }

        const userLevel = socket.request.user.orbits.find(v => v.planet == socket.request.user.currentOrbit).userLevel
        const lives = room.game.lives > 0 ? room.game.lives : 2

        // init Game
        room.game = new Game(
            room.game.orbit,
            userLevel,
            {
                paddleX: player.paddleX,
                paddleY: player.paddleY,
            },
            0,
            lives,
        )

        // init paddle
        room.game.spawnPaddle()
        // init level
        room.game.spawnLevel()
        // init background particles
        //room.game.initParticles()
        // init ball
        room.game.spawnBall(player.paddleX, player.paddleY)
        // init canvas
        canva = new Canva()

        canva.draw(
            room.game.particles,
            room.game.balls,
            room.game.paddles,
            room.game.bricks,
            room.game.bonuses,
            room.game.hue)

        io.to(player.roomId).emit('play',
            room.game.score,
            room.game.lives,
            room.game.level,
            room.game.timer,
            room.game.win,
            //canva.canvas.toBuffer('image/png', {compressionLevel: 0, filters: canva.canvas.PNG_FILTER_NONE})
            canva.canvas.toDataURL('image/jpeg', {quality: 0.3})
        )
    })

    socket.on('disconnect', () => {
        //console.log(`[disconnect] ${socket.id}`)
        let room = null

        rooms.forEach((r) => {
            r.players.forEach((p) => {
                if (p.socketId === socket.id && p.host) {
                    room = r
                    rooms = rooms.filter((r) => r !== room)
                }
            })
        })
    })
})

function createRoom(player, orbit, level, lives) {
    const room = {
        id: roomId(),
        players: [],
        game: new Game(
            orbit,
            level,
            {
                paddleX: player.paddleX,
                paddleY: player.paddleY,
            },
            0,
            lives,
        ),
    }
    player.roomId = room.id

    room.players.push(player)
    rooms.push(room)

    return room
}

function roomId() {
    return Math.random().toString(36).substr(2, 9)
}


