const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('../models/User')

// Store user session
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    cb(null, {
      id: user.id,
      username: user.email,
      pseudo: user.username,
      date: user.freeGameDate,
      level: user.level,
      lives: user.lives
    })
  })
})
passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user)
  })
})

// Define strategy method for authentification
passport.use(
    new LocalStrategy({usernameField: 'email'}, function (username, password, cb) {
      // Find user with requested email
      User.findOne({ email: username }).then((user) => {
        if (!user) {
          return cb(null, false, { message: 'User not found.' })
        }
        if (!user.validPassword(password)) {
          return cb(null, false, { message: 'Incorrect username or password.' })
        }
        return cb(null, user)
      })
    }),
)

router.get('/login', function (req, res) {
  res.render('login')
})

router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/game',
      failureRedirect: '/users/login',
      failureFlash: true
    }))

router.post('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.flash('success_msg', 'Vous êtes déconnecté')
    res.redirect('/')
  })
})

router.get('/register', function (req, res) {
  res.render('register')
})

router.post('/register', async function (req, res) {
  const { username, email, password, passwordCfm } = req.body
  let errors = []
  if (!username || !email || !password || !passwordCfm) {
    errors.push({ msg: 'Veuillez remplir tous les champs' })
  }
  if (password.length < 6) {
    errors.push({
      msg: "Le mot de passe doit être composé d'au moins 6 charactères",
    })
  }
  if (password !== passwordCfm) {
    errors.push({ msg: 'Veuillez vérifier votre mot de passe' })
  }
  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
      passwordCfm,
    })
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: 'Utilisateur avec cet email existe déjà' })
        res.render('register', {
          errors,
          username,
          email,
          password,
          passwordCfm,
        })
      } else {
        const newUser = new User({
          username,
          email,
        })

        newUser.setPassword(password)
        newUser.save().then((user) => {
          res.redirect('/users/login')
        })
      }
    })
  }
})

module.exports = router
