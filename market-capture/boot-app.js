/**
 boot-app.js
 @author ashu
**/

// Express into module
var express = require('express');
var path = require('path');
var constants = require(path.join(__dirname, '/utils/', 'constants-util'));

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');
var session = require('express-session');
var flash = require('connect-flash');

// set up express 
var app = express();

/**
set up environment for the application
**/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
// activate sessions before flash
app.use(session({
	secret: '21ffsa*',
	saveUninitialized : true,
	resave: true
}));
app.use(cookieParser());

app.use(flash());

// default flash message configs
app.use(function(req, res, next) {
	res.locals.errorMessage = req.flash('errorMessage');
	next();
});

// set up the view engine to be used here
app.set('view engine', 'jade');
// add views to app environemnt
app.set('views', path.join(__dirname, constants.APP_VIEWS_PATH));
// util js to the app environment
app.set('utils', path.join(__dirname, constants.APP_UTILS_PATH));
// setup assets/statics to the app environment
app.use(express.static((path.join(__dirname, constants.APP_PUBLIC_PATH))));

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

var welcomeInitilizer = require('./routes/view-initializer');
// register page initializations
var registerInitializer = require('./routes/register-merchant');

var dbConnector = require('./utils/database-connector');
var connector = dbConnector.getClientConnector();
// set page links
app.use(welcomeInitilizer);
app.use('/register',  registerInitializer);

// export this to the application kick start js
module.exports = app;