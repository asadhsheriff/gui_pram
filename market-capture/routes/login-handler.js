/**
This module should handle user login details and related requests 
1. this module should ideally be controlled by register merchant.js
**/

var express = require('express');
var path = require('path');


module.exports = {
	validateUser : function(req, res) {
		// if user already exist in session and request object return him to the my profile page
		if (req.user) 
			res.redirect('myprofile');
		else {
			
		}		
	}
};
