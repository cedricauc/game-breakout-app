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
  if(today == req.user.date) {
    flag = false
  }
  res.render('game', {user: req.user.pseudo, flag: flag});
});

router.post('/shop', passport.authenticate('session'),  function(req, res) {
  res.render('shop', {user: req.user.username});
});

module.exports = router;