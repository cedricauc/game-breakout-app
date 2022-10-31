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
  res.render('game', {user: req.user.pseudo, flag, msg, level: req.user.level, lives: req.user.lives,});
});

router.post('/shop', passport.authenticate('session'), async function(req, res) {
  res.render('shop', {user: req.user.pseudo});
});

router.get('/shop', passport.authenticate('session'), async function(req, res) {
  res.render('shop', {user: req.user.pseudo});
});

router.get('/trophy', passport.authenticate('session'), async function(req, res) {
  // Modify DB
  //console.log('route get ', req.user.pseudo);
  let today = new Date().toDateString()
  let flag = true
  if(today == req.user.date) {
    flag = false
  }
  res.render('trophy', {user: req.user.pseudo, level: req.user.level, lives: req.user.lives,  flag: flag});
});

router.post('/home', passport.authenticate('session'), async function(req, res) {
  res.render('dashboard', {user: req.user.pseudo});
});

module.exports = router;