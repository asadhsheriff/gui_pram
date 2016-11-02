// initialize router with expres for view initializing
var express = require('express');
var router = express.Router();

// get path module for rendering
var path = require('path');

// intialize home page renderer and their actions accordingly
router.get('/', function(req, res, next) {
	res.redirect('welcome');
	next();
});

// intializing welcome page
router.get('/welcome', function(req, res, next) {
	res.render(path.join(__dirname, '/../views/base-views/', 'home-welcome'));
	next();
});

// for login post handler
router.post('/welcome', function(req, res, next) {
	// get parameters from req params and process the authentication
	console.log("post call from welcome");
});

module.exports = router;
