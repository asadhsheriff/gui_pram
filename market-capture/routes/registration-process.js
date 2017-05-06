var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/registrationprocess', function(req, res, next) {
	console.log('inside resgistration process');
	if (req.user)
		res.redirect('/myprofile');
	req.session.v = req.query.v;
	req.session.g = req.query.g;
	req.session.x = req.query.x;
	//console.log(req.query);
	//res.redirect('/register-merchant?v=' + hashString + '&g=' + email + '&x=' + time + '&allowRedirection=true');
	res.redirect('/register-merchant');
	// TODO welcome the user and company
	//res.render(path.join(__dirname, '/../views/base-views/', 'first-time-registration'));
});

//v=1hZuFn_6sofRgu8_khTWVKGKQ_R&g=asadhsheriff8@gmail.com&x=1488851338308
// router.get('/register-merchant', function(req, res, next) {
// 	console.log('inside resgistration process');
// 	if (req.user)
// 		res.redirect('/myprofile');
// 	res.render(path.join(__dirname, '/../views/base-views/', 'first-time-registration'));
// });

router.get('/register-merchant', function(req, res, next) {
	console.log(req.body);
	console.log(req.query);
	var hashString = req.session.v;
	var email = req.session.g;
	var time = req.session.x;
	req.session.v = null;
	req.session.g = null;
	req.session.x = null;
	
	res.render(path.join(__dirname, '/../views/base-views/', 'first-time-registration'));
});

module.exports = router; 