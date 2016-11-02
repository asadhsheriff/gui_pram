/**
@Ashu

route to process all password reset related request from UI
**/
var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
	if (req.user) {
		redirect('/welcome');
	} else {
		
	}
	// TODO check if the user is already logged in then redirect it to home page if yes,
	// TODO if not logged in then check if the user has asked for reset of the password

});

router.post('/', function(req, res, next) {
	req.checkBody('pass-first', 'Password field cannot be empty').notEmpty();
	req.checkBody('pass-confirm-second', 'Confirm password field cannot be empty').notEmpty();
	req.checkBody('pass-confirm-second', 'Passwords do not match').equals(req.body['pass-first']);

	var errors = req.validationErrors();
	if (errors) {
		req.flash('RegisterLogin', errors);
		res.redirect('');
	} else {

	}

});


module.exports = router;