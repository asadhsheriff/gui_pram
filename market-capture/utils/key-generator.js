var generator = require('password-generator');

module.exports = {

	// TODO enhance the funciton to take user related info to generate based on user information
	generateHash : function() {
		var randomLength = Math.floor(Math.random() * (60 - 16)) + 16;
		//var hashString = generator(randomLength, false, /[\d\W\w\p]/);
		var hashString = generator(randomLength, false);
		return hashString
	}

};