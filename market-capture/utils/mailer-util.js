/**
author Ashu
*/

/**
* Mailer util to send emails for different purposes
**/
var nodemailer = require('nodemailer');
var emailValidator = require('email-existence');
var loggerConf = require('./context-utils/logger-conf');
var logger = loggerConf.getLogger();
var async = require('async');
var BASE_URL = 'http://127.0.0.1:12323/';
var mailTypes = {
	"WELCOME" : "WELCOME"
};

/**
 transporter initialization
*/
console.log('initializing transporter');
var smtpTransport = nodemailer.createTransport("SMTP", {
  service: "Gmail",
  auth: {
    XOAuth2: {
      user: "capsullehelpcenter@gmail.com",
      clientId: "836184596048-5visvp6vv94riguhlmadubcbe6tvusnv.apps.googleusercontent.com",
      clientSecret: "5OWFDa4DnQrMFgHhJ6CDDfon",
      refreshToken: "1/q5wHtYrQSeESpVFM8NSNz6lb1uf12H_0BKTcf1bOuvk"
    }
  }
});

// default mail body
var MAIL_BODY = {
	from: 'capsullehelpcenter@gmail.com', // sender address 
    to: 'asadhsheriff8@gmail.com', // list of receivers 
    subject: 'Hello ✔', // Subject line 
    text: 'Hello world', // plaintext body 
    html: '<b>Hello world</b>' // html body 
};

/**
private util functions
**/
function constructMessageContent(fields, type) {
	var validatedDataResult = validateData(fields, type);

	// check if we bypassed the data validation
	if(validatedDataResult) {
		console.log('data validation failed for the provided data');
		console.log(validatedDataResult);
		return validatedDataResult;
	}
	// proceed with message body construction
	return constructMailBody(fields, type);
};

function validateData(fields, type) {
	if (!fields)
		return 'Data cannot be empty to proceed';
	if(!fields['first-name']) {
		// ideally the code should not come here
		return 'First name cannot be empty';
	}
	if(!fields['merchant-name']) {
		// ideally the code should not come here
		return 'Merchant shop name cannot be empty';
	}
	if(!fields['email-id']) {
		// ideally the code should not come here
		return 'Email id cannot be empty';
	}
	if(!fields['phone-number']) {
		// ideally the code should not come here
		return 'phone number cannot be empty';
	}

	if(type == 'WELCOME' && !fields['hash-key']) {
		return 'Hash key is not found in data to generate welcome mail';
	}
};

function validateIsValidEmailId(mailContent, callback) {
	// check the validator
	emailValidator.check(mailContent["to"], function(err, response) {
		if (err) {
			logger.error('Exception occured while checking if the email is valid. ', 
				{ EmailId: emailId, Error : err});
			return callback(err, null);
		}
		console.log('Validation response');
		console.log(response);
		return callback(null, mailContent);
	});
};

function sendMailToRegisterar(mailContent, callback) {
	// generic method so content cannot be empty
	if (!mailContent) {
		return callback('Content is invalid to send mail', null);
	}

	if (!smtpTransport) {
		smtpTransport = initializeTransporter();
	} 
	console.log('sending mail');
	console.log(mailContent);
	// you can change the contect of mail from here
	smtpTransport.sendMail(mailContent, function(error, info){
    	if (error){
        	console.log(error);
        	return callback(error, null);
    	}
    	console.log('Message sent: ' + info.response);
    	// XXX notice that it will return if the mail content sending was succesful or not
    	return callback(null, true);
	});
}

function constructMailBody(validatedContents, type) {

	// TODO make use of type to identify type of mail you are going to send, use switch case
	if (type == 'WELCOME') {
		var baseMessageBody = MAIL_BODY;

		baseMessageBody.from = 'capsullehelpcenter@no-reply.com';
		baseMessageBody.to = validatedContents['email-id'];
		baseMessageBody.text = 'Hello ' + validatedContents['first-name'] + ',';
		baseMessageBody.html = '<p> Welcome to the group <span>Capsulle</span>,</p><br>'
							+ '<p>As per our terms and conditions please click on this <a href="'+ getUrl(validatedContents, type) +'">link</a> to validate'
							+ ' and proceed with actual registration. Once the registration is done,'
							+ ' you could proceed with uploading coupons on your account.<p>'
							+ '<p></p>'
							+ '<p></p>'
							+ '<p>Regards, </p>'
							+ '<p>Capsulle</p>'
							+ '<footer> <p>Capsulle, LLC.,</p>'
							+ '<p> For any further queries write us on capsullehelpcenter@gmail.com.</p><footer>';
		baseMessageBody.subject = 'Capsulles | Welcome ' + validatedContents['merchant-name']; 

		return baseMessageBody;
	}
	return;
};

function getUrl(fields, type) {
	var url = BASE_URL;
	if (type == 'WELCOME') {
		var url = BASE_URL;
		url += '/registrationprocess';
		url += '?v=' + fields['hash-key'] + '&';
		url += 'g=' + fields['email-id'] + '&';
		url += 'x=' + (new Date().getTime());
	}
	// if it does not satisfy the condition then it will return home url :D
	return url;
}

function getTypeSpecificEmail(type) {
	
};

/**
Initialize node mialer if it is not initialized
**/
function initializeTransporter() {
	return (nodemailer.createTransport("SMTP", {
		  service: "Gmail",
		  auth: {
		    XOAuth2: {
		      user: "capsullehelpcenter@gmail.com",
		      clientId: "836184596048-5visvp6vv94riguhlmadubcbe6tvusnv.apps.googleusercontent.com",
		      clientSecret: "5OWFDa4DnQrMFgHhJ6CDDfon",
		      refreshToken: "1/q5wHtYrQSeESpVFM8NSNz6lb1uf12H_0BKTcf1bOuvk"
		    }
		  }
		}));
};


/**
exposed memeber functions for util usability
**/
module.exports = {

	sendWelcomeMail : function(fields, callback) {
		// result is always boolean
		async.waterfall([
			function validateField(callback) {
				var validationResult = validateData(fields); 
				if (validationResult) {
					return callback(validationResult, null);
				}
				var mailContent = constructMailBody(fields, 'WELCOME');
				if (!mailContent) {
					return callback('Invalid mail body to be sent', null);
				} else {
					return callback(null, mailContent);
				}
			},
			function validateEmailId(mailContent, callback) {
				validateIsValidEmailId(mailContent, callback);
			},
			function sendMail(mailContent, callback) {
				sendMailToRegisterar(mailContent, callback);
			}
			],
			function(err, result) {
				if (err) {
					console.log('Exception occured while processing request for mailing');
					console.log(err);
					return callback(err, null);
				}
				return callback(null, true);
		});
	},

	sendMail : function(mailBody) {
		// check if the mail body is valid
		if (!mailBody) {
			console.log('No valid mail body found to proceed');
			return 'No valid mail body found to proceed';
		}

		// send the mail to the valid recipient
		if (!transporter) {
			transporter = initializeTransporter();
		}
	}, 

	/**
	validate email id using email existence module
	**/
	validateIsValidEmailId : function(emailId) {
		if (!emailId) {
			return false;
		}
		var validatorResult = false;
		// check the validator
		emailValidator.check(emailId, function(err, response) {
			if (err) {
				logger.error('Exception occured while checking if the email is valid. ', 
					{ EmailId: emailId, Error : err});
				//	exiting with exception
				return;
			}
			console.log('valid email');
			validatorResult = response;
		});
	}
};
