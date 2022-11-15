const express = require('express')
const router = express.Router()
const passport = require('passport')
const User = require('../models/User')

const orbitList = require('../datas/orbitList')

router.get('/', function (req, res) {
    res.render('index');
});

router.get('/game', passport.authenticate('session'), async function (req, res) {
    const freeGameNotification = hasFreeGame(req.user.date)

    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('game', {
        user: req.user.pseudo,
        points: req.user.points,
        lives: req.user.lives,
        gamesNbr: req.user.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
    });
});

router.post('/game', passport.authenticate('session'), async function (req, res) {
    const filter = {email: req.user.username, orbits: {$elemMatch: {planet: req.body.planet}}};
    let currentUser = await User.findOne(filter)

    //let orbit
    if (!currentUser) {
        const push = {planet: req.body.planet}
        currentUser = await User.findOneAndUpdate({email: req.user.username}, {currentOrbit: req.body.planet, $push: {orbits: push}}, {new: true})
    }

    const currentOrbit = currentUser.orbits.find(v => v.planet == req.body.planet)

    req.user.currentOrbit = req.body.planet
    req.user.level = currentOrbit.userLevel
    req.user.bestScore = currentOrbit.bestScore

    const freeGameNotification = hasFreeGame(currentUser.date)
    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('game', {
        user: currentUser.pseudo,
        points: currentUser.points,
        lives: currentUser.lives,
        gamesNbr: currentUser.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
    });
})

router.post('/shop', passport.authenticate('session'), async function (req, res) {
    const points = req.user.points - 5
    const games = req.user.gamesNbr + 1
    const filter = {email: req.user.username};
    const update = {credit: points, gamesNbr: games};
    const freeGameNotification = hasFreeGame(req.user.date)
    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('shop', {
        user: req.user.pseudo,
        points: req.user.points,
        lives: req.user.lives,
        gamesNbr: req.user.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
    });
})

router.get('/shop', passport.authenticate('session'), async function (req, res) {
    const freeGameNotification = hasFreeGame(req.user.date)

    const filter = {email: req.user.username}
    let currentUser = await User.findOne(filter)

    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('shop', {
        user: currentUser.pseudo,
        points: currentUser.points,
        lives: currentUser.lives,
        gamesNbr: currentUser.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
    });
});

router.get('/trophy', passport.authenticate('session'), async function (req, res) {
    const allUsers = await User.find({}, {username: 1, bestScore: 1, timePlay: 1}).sort({bestScore: -1});

    const freeGameNotification = hasFreeGame(req.user.date)

    const filter = {email: req.user.username}
    let currentUser = await User.findOne(filter)

    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('trophy', {
        user: currentUser.pseudo,
        points: currentUser.points,
        lives: currentUser.lives,
        gamesNbr: currentUser.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
        allUsers: allUsers
    });
});

router.get('/home', passport.authenticate('session'), async function (req, res) {
    const filter = {email: req.user.username}

    const freeGameNotification = hasFreeGame(req.user.date)

    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('dashboard', {
        user: req.user.pseudo,
        level: userLevel,
        lives: req.user.lives,
        points: req.user.points,
        gamesNbr: req.user.gamesNbr,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
        orbitList
    });
});

router.post('/home', passport.authenticate('session'), async function (req, res) {
    const freeGameNotification = hasFreeGame(req.user.date)

    const userLevel = req.user.currentOrbit ? req.user.orbits.find(v => v.planet == req.user.currentOrbit).userLevel : ''

    res.render('game', {
        user: req.user.pseudo,
        points: req.user.points,
        lives: req.user.lives,
        gamesNbr: req.user.gamesNbr,
        level: userLevel,
        flag: freeGameNotification.flag,
        msg: freeGameNotification.msg,
    });
});

function hasFreeGame(dt) {
    let today = new Date().toDateString()
    let flag = true
    let msg = ""
    if (today === dt) {
        flag = false
        msg = "Vous avez joué le jeu gratuit"
    } else msg = "Vous avez 1 jeu gratuit"

    return {flag, msg}
}

module.exports = router;