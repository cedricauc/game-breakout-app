const express = require('express');
const router = express.Router()
const passport = require('passport');
const User = require('../models/User')

router.get('/', function(req, res) {
  res.render('index');
});

router.get('/game', passport.authenticate('session'), async function(req, res) {
  // Modify DB
  //console.log('route get ', req.user.pseudo);
  let today = new Date().toDateString()
  let flag = true
  let msg = ""
  if(today == req.user.date) {
    flag = false
    msg = "Vous avez joué le jeu gratuit"
  } else msg = "Vous avez 1 jeu gratuit"
  res.render('game', {user: req.user.pseudo, flag, msg, level: req.user.level, lives: req.user.lives, points: req.user.points});
});

router.post('/shop', passport.authenticate('session'), async function(req, res) {
  let points = req.user.points -5
  let games = req.user.gamesNbr +1
  const filter = { email: req.user.username };
  const update = { credit: points, gamesNbr: games };
  await User.findOneAndUpdate(filter, update)
  const currentUser = await User.findOne(filter)
  req.user.points = currentUser.credit
  req.user.gamesNbr = currentUser.gamesNbr
  res.render('shop', {user: req.user.pseudo, points: req.user.points, gamesNbr: req.user.gamesNbr});
})


router.get('/shop', passport.authenticate('session'), async function(req, res) {
  res.render('shop', {user: req.user.pseudo, points: req.user.points, gamesNbr: req.user.gamesNbr});
});

router.get('/trophy', passport.authenticate('session'), async function(req, res) {
  let allUsers = await User.find({}, { username: 1, bestScore: 1, timePlay: 1 }).sort( { bestScore: -1 });

  let today = new Date().toDateString()
  let flag = true
  if(today == req.user.date) {
    flag = false
  }
  res.render('trophy', {
    user: req.user.pseudo,
    level: req.user.level,
    lives: req.user.lives,
    flag: flag,
    allUsers: allUsers});
});

router.post('/home', passport.authenticate('session'), async function(req, res) {
  res.render('dashboard', {user: req.user.pseudo});
});

module.exports = router;