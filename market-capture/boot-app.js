/**
 boot-app.js
 @author ashu
**/

// Express into module
var express = require('Express');
var routes = require('path');

// set up express 
var express = express();

/**
set up environment for the application
**/

// set up the view engine to be used here
app.set('view engine', 'jade');
// add views to app environemnt
app.set('views', path.join(__dirname, APP_VIEWS_PATH));
// util js to the app environment
app.set('utils', path.join(__dirname, APP_UTILS_PATH));
// setup assets/statics to the app environment
app.use(express.static(), (path.join(__dirname, APP_VIEWS_PATH)));
// add views to app usage
app.use('views', path.join(__dirname, APP_VIEWS_PATH));
// add utils to the app usage
app.use('/', path.join(__dirname, APP_UTILS_PATH));


// export this to the application kick start js
module.exports = app;