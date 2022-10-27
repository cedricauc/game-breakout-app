const express = require('express');
const path = require('path');
const expressValidator = require('express-validator');
const expressLayouts = require('express-ejs-layouts')
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const mongoose = require('mongoose')
const db = require('./config/data').mongoURI
const secret = require('./config/data').secret
const helmet = require('helmet');

const PORT = process.env.PORT || 5000;

const routes = require('./routes/index');
const users = require('./routes/users');

//Init app
const app = express();

// DB
mongoose.connect(db,{ useNewUrlParser: true, useUnifiedTopology: true})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// View engine
app.set('view engine', 'ejs');
app.use(expressLayouts);

// express bodyParser
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Express session
app.use(session({
  secret: secret,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false }
}))

app.use(passport.initialize());
app.use(passport.session())

// Connect flash
app.use(flash())
// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

//Security HTTP Headers
app.use(helmet({
  contentSecurityPolicy:false
}))

app.use('/', routes);
app.use('/users', users);

app.listen(PORT, console.log(`Server running on  ${PORT}`));