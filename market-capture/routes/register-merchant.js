/**
@author ashu
*/

/**
imports required
*/
// initialize router with expres for view initializing
var express = require('express');
var router = express.Router();
// packages required for reading the form data for registration

// packages required for reading the form data for registration
var fs = require('fs');
var formidable = require('formidable');
var util = require('util');
// get path module for rendering
var path = require('path');
var nodemailer = require('./../utils/mailer-util');
var databaseHandler = require('./../utils/database-connector');
var loggerConf = require(path.join(__dirname, '/../utils/context-utils/', 'logger-conf'));
var logger = loggerConf.getLogger();
var connector = databaseHandler.getClientConnector();
var keyGen = require('./../utils/key-generator');
var async = require('async');
var userModel = require('../models/user-model');

// intialize home page renderer and their actions accordingly
router.get('/', function(req, res, next) {
	// take it to the welcome home page
	res.render(path.join(__dirname, '/../views/base-views/', 'register-merchant'));
	console.log('Welcome to register page');
	next();
});

router.post('/', function(req, res, next) {
	// validate input data
	var errors = validateFormData(req);
	if (!errors) {
		processNewRegisterMerchantRequest(req, res);
	} else {
		req.flash('errorMessage', errors);
		res.render(path.join(__dirname, '/../views/base-views/', 'register-merchant'), {
			errorMessage : req.flash('errorMessage')
		});		
	}
	//next();
	// redirect to home page once it is done
});

function processNewRegisterMerchantRequest(req, res) {
	console.log('Processing new client request');	
	var formFields = {};
	async.waterfall([
		function getFormData(callback) {
			// extract form fields from req to local object
			formFields['email-id'] = req.body['email-id'];
			formFields['first-name'] = req.body['first-name'];
			formFields['last-name'] = req.body['last-name'];
			formFields['merchant-name'] = req.body['merchant-name'];
			formFields['phone-number'] = req.body['phone-number'];
			// pass over to next method of water flow
            callback(null, formFields);
        },
        function getUser(fields, callback) {
            console.log(fields);
            // get user details from user primary info
            userModel.getUserAsync(fields["email-id"], callback);
        }, function filterOutUser(users, callback) {
        	var isUserExist = false;
        	var isFirstTime = false;
        	if (users && users.rowLength) {
        		// ideally there should be only one row for a user here. May be we can have 
        		// an audit table for the user to track activation and deactivation later
        		for(var iter = 0; iter< users.rowLength; iter++) {
                    if (users.rows[iter]["user_active"]) {
                        isUserExist = true;
                    }
                    if (users.rows[iter]["is_first_time"]) {
                        isFirstTime = true;
                    }                    
            	}
        	}
        	if (isUserExist && !isFirstTime) {
        		return callback('User already exist and has been deactivated!', null);
        	} else {
        		return callback(null, formFields['email-id'], isFirstTime);
        	}
        },
        function generateUniqueHashForUser(userName, isUserFirstTime, callback) {
        	if (isUserFirstTime) {
        		// get new hash generated / exising key from DB 
        		userModel.getHashKeyForExistingUser(userName, callback);
        	} else {
            	return getHashKey(userName, callback);
            }
        }, function createNewUser(hashKey, callback) {
        	formFields['hash-key'] = hashKey;
        	return userModel.createNewUser(formFields, callback);
        }, function sendMail(isUserCreationSuccessful, callback) {
        	if (isUserCreationSuccessful) {
        		return nodemailer.sendWelcomeMail(formFields, callback);
        	}
        	return callback('Unable to create user', null); 
        }], 
		function(err, results) {
			if (err) {
				console.error("Error occured");
				console.error(err);
				req.flash('errorMessage', {
					msg : err
				});
				//console.log(req.flash('errorMessage'));
				res.render(path.join(__dirname, '/../views/base-views/', 'register-merchant'), {
					errorMessage : req.flash('errorMessage')
				});
				return;
			} 
			console.log(results);
			// flash the success message
			res.redirect('/');
			return;
		});
}

// fields should contain the hashkey as well
function makePrimaryEntryToDb(fields, callback) {

}

function validateFormData(req) {

	req.checkBody('first-name', 'First Name is missing').notEmpty();
	req.checkBody('phone-number', 'Phone number is missing').notEmpty();
	req.checkBody('merchant-name', 'Name of merchant is missing').notEmpty();
	req.checkBody('email-id', 'Email id is invalid').isEmail();

	var errors = req.validationErrors();
	if (errors) {
		return errors;
	} else {
		return;
	}
}

function getHashKey(userName, callback) {
	var hashKey = keyGen.generateHash();
	console.log(hashKey);
	connector.execute("select * from user_space.hash_to_email_id_map where unique_hash_string = ? ", [hashKey], function (err, result) {
		if (err) {
			return callback(err, null);
		}

		console.log(result);
		console.log("in callback");
		
		if (result.rowLength) {
			// there is one row active, so we cannot use that hash, we need a new hash
			return getHashKey(userName, callback);
		} else {
			// unique key is generated, proceed with work
			callback(null, hashKey);
		}
	});
	return;
}

function checkIfUserAlreadyExist(fields) {
	var userName = fields["email-of-shop"];
	console.log("check if user exist");
	connector.execute("select * from user_space.user_primary_info where email_id = ? ", [userName], 
		function(err, result) {
			console.log('Executed');
			if (err) {
				console.log(err);
				// TODO log the error
				return;
			}
			var isUserExist = false;

			if (result.rowLength) {
				for(var iter = 0; iter< result.rowLength; iter++) {
					if (result.rows[iter]["user_active"]) {
						isUserExist = true;
					}
				}
			} else {
				isUserExist = true;
			}

			if (isUserExist) {
				console.log('User does not exist');
				registerMerchantToDB(fields);
			}
	});
}

module.exports = router;

