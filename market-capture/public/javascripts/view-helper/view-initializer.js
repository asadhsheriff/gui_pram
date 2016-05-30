// initialize router with expres for view initializing
var express = require('express');
var router = express.Router();

// get path module for rendering
var path = require('path');

// intialize home page renderer and their actions accordingly
router.get('/', function(req, res, next) {
	// take it to the welcome home page
	console.log('Redirecting to home dir');
	res.redirect('welcome');
	next();
});

// intializing welcome page
router.get('/welcome', function(req, res, next) {
	console.log('Welcome page..');
	res.render(path.join(__dirname, '../../static-renderer', 'home-welcome'));
	next();
});

// for login post handler
router.post('/welcome', function(req, res, next) {
	// get parameters from req params and process the authentication
});

console.log('Initialized view welcome');
// export the router
module.exports = router;
