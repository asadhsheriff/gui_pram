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
console.log('connected to db');
var keyGen = require('./../utils/key-generator');
var async = require('async');

// intialize home page renderer and their actions accordingly
router.get('/', function(req, res, next) {
	// take it to the welcome home page
	res.render(path.join(__dirname, '/../views/base-views/', 'register-merchant'));
	console.log('Welcome to register page');
	next();
});

router.post('/', function(req, res, next) {
	console.log('doing a post call for new merchant register');
	processNewRegisterMerchantRequest(req, res);
	next();
});

function processNewRegisterMerchantRequest(req, res) {
	console.log('Processing new client request');	
	var formFields;
	async.waterfall([
		function getFormData(callback) {
            var form = new formidable.IncomingForm();
            // read the form and get it as fields
            form.parse(req, function (err, fields, files) {
                // check if any exception occured
                if (err) {
                    return callback(err, null);
                }
                // validate the given fields 
                var validatedResult = validateFormData(fields);
                if (validatedResult) {
                    return callback(validatedResult, null);
                }
                callback(null, fields);
            });
        },
        function checkIfUserExist(fields, callback) {
            var userName = fields["email-of-shop"];
            formFields = fields;
            connector.execute("select * from user_space.user_primary_info where email_id = ? "
                , [userName], function(err, result) {
                    console.log('Executed');

                    if (err) { 
                        console.log(err);
                        // TODO log the error
                        return callback(err, null);
                    }
                var isUserExist = false;

                if (result.rowLength) {
                    for(var iter = 0; iter< result.rowLength; iter++) {
                        if (result.rows[iter]["user_active"]) {
                            isUserExist = true;
                        }
                    }
                }

                if ( isUserExist) {
                    return callback('User already exist!', null);
                }
                return callback(null, userName);
            });
        },function generateUniqueHashForUser(userName, callback) {
            getHashKey(userName, callback);
        }, function sendMail(hashKey, callback) {
        	formFields['hash-key'] = hashKey;
        	nodemailer.sendWelcomeMail(formFields, callback);
        }], 
		function(err, results) {
			if (err) {
				console.error("Error occured");
				console.error(err);
				return;
			} 
			console.log(results);
			return;
		});
}

// fields should contain the hashkey as well
function makePrimaryEntryToDb(fields, callback) {

}

function validateFormData(fields) {
	// TODO validate these fields at javascript level/ this should be second check to handle the data
	if(!fields['name-of-register']) {
		// ideally the code should not come here
		return 'Name of the merchant cannot be empty';
	}
	if(!fields['name-of-shop']) {
		// ideally the code should not come here
		return 'Name of the merchant shop cannot be empty';
	}
	if(!fields['email-of-shop']) {
		// ideally the code should not come here
		return 'Phone number of the shop cannot be empty';
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
	//console.log(connector);
	/*connector.eachRow("select * from user_space.user_primary_info where email_id = ? ", [userName], 
		function(index, row) {
			if (row["user_active"]) {
				// do nothing
				console.log('user already exisit');
				keyGen.generateHash();
			} else {
				console.log('user doest not exist');
				console.log(fields);
				registerMerchantToDB(fields);
			}
		}, function(err) {
			console.log("error");
			console.log(err);
		});*/
}

// export the router
module.exports = router;

