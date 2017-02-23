var express          = require('express');
var path            = require('path');
var favicon         = require('serve-favicon');
var logger          = require('morgan');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');
const mongoose      = require("mongoose");
const session       = require("express-session");
const User          = require("./models/user");
const flash         = require("connect-flash");
const expressLayouts = require('express-ejs-layouts');
const MongoStore = require('connect-mongo')(session);
const auth = require('./helpers/auth');
const moment        = require('moment');


// MONGOOSE CONNECT
mongoose.connect("mongodb://localhost/amandoug-database");


// routes


const users = require('./routes/users');
const authController = require("./routes/authController");
const events = require("./routes/events");
const photos = require("./routes/photos");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// MIDDLEWEARS

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');

// express session middlewear
app.use(session({
  secret: "passport-local-strategy",
  resave: true,
  saveUninitialized: true
}));

app.use(flash());
const passport = require('./helpers/passport')
app.use(passport.initialize());
app.use(passport.session());

app.use(auth.setCurrentUser);





// middlewear that checks if it's logged in - not ensure if it's logged in


app.use('/', authController);
app.use('/', users);
app.use('/', events);
app.use('/', photos);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
