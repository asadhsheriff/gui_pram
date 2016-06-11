
// initialize router with expres for view initializing
var express = require('express');
var router = express.Router();

// get path module for rendering
var path = require('path');

// intialize home page renderer and their actions accordingly
router.get('/', function(req, res, next) {
	// take it to the welcome home page
	res.render(path.join(__dirname, '../../static-renderer', 'register-merchant'));
	console.log('Welcome to register page');
	next();
});

// export the router
module.exports = router;

