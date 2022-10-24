const express = require('express');
const router = express.Router()
const passport = require('passport');

router.get('/', function(req, res) {
    res.render('index');
  });

router.get('/home', passport.authenticate('session'), function(req, res) {
    res.render('dashboard', {user: req.user.username});
  });

router.get('/game', passport.authenticate('session'), function(req, res) {
    res.render('game', {user: req.user.username});
  });

module.exports = router;