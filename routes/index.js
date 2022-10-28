const express = require('express');
const router = express.Router()
const passport = require('passport');
const User = require('../models/User')

router.get('/', function(req, res) {
    res.render('index');
  });

// router.get('/home', passport.authenticate('session'), function(req, res) {
//     res.render('dashboard', {user: req.user.username});
//   });

router.post('/game', passport.authenticate('session'), async function(req, res) {
  // Modify DB
  let date = new Date().toDateString()
  await User.updateOne( { freeGameDate: date });
  await User.findOne()
  res.render('game', {user: req.user.username});
});

router.post('/shop', passport.authenticate('session'),  function(req, res) {
  
  res.render('shop', {user: req.user.username});
});

// router.get('/game', passport.authenticate('session'), function(req, res) {
//     res.render('game', {user: req.user.username});
//   });

module.exports = router;