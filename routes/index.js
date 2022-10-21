const express = require('express');
const router = express.Router()
const passport = require('passport');

router.get('/', function(req, res) {
    res.render('index');
  });

router.get('/home', passport.authenticate('session'), function(req, res) {
    res.render('dashboard');
  });

router.get('/game', passport.authenticate('session'), function(req, res) {
    res.render('game');
  });

module.exports = router;