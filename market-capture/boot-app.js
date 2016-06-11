/**
 boot-app.js
 @author ashu
**/

// Express into module
var express = require('express');
var path = require('path');
var constants = require(path.join(__dirname, '/public/javascripts/utils/', 'constants-util'));

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// set up express 
var app = express();

/**
set up environment for the application
**/

// set up the view engine to be used here
app.set('view engine', 'jade');
// add views to app environemnt
app.set('views', path.join(__dirname, constants.APP_VIEWS_PATH));
// util js to the app environment
app.set('utils', path.join(__dirname, constants.APP_UTILS_PATH));
// setup assets/statics to the app environment
app.use(express.static((path.join(__dirname, constants.APP_VIEWS_PATH))));
// add views to app usage
//app.use('views', path.join(__dirname, constants.APP_VIEWS_PATH));
// add utils to the app usage
//app.use('/', path.join(__dirname, constants.APP_UTILS_PATH));

var welcomeInitilizer = require('./public/javascripts/view-helper/view-initializer');
// register page initializations
var registerInitializer = require('./public/javascripts/view-helper/register-merchant');
// set page links
app.use(welcomeInitilizer);
app.use('/register',  registerInitializer);
console.log('Initilized boot app');


// export this to the application kick start js
module.exports = app;