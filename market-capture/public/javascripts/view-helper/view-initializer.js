var app = require('../../../app');

// intialize home page renderer and their actions accordingly
app.use('/', function(req, res, next) {
	// take it to the welcome home page
	res.redirect('welcome');
	next();
});

app.use('/welcome', function(req, res.next) {
	// render the welcome page
	next();
});