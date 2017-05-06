var dbConnector = require('../utils/database-connector');
var loggerConf = require('../utils/context-utils/logger-conf');
var async = require('async');
var keyGen = require('../utils/key-generator');

const INSERT_PRIMARY_USER_INFO = 'INSERT into user_space.user_primary_info (email_id, company_name, country_pin, first_name, last_name, '
 		+ 'middle_name, phone_number, user_active) values (?, ?, ?, ?, ?, ?, ?, ?)';
const UPDATE_PRIMARY_USER_ACTIVE = 'UPDATE user_space.user_primary_info set  user_active = true WHERE email_id = ?';
const INSERT_KEY_USER_INFO = 'INSERT into user_space.user_key_info (email_id, generated_timestamp, is_active, '
		+ 'is_first_time, pass, unique_hash_string) values (?, ?, ?, ?, ?, ?)';
		// this should die in 45 minutes
const INSERT_HASH_INFO = 'INSERT into user_space.hash_to_email_id_map (unique_hash_string, email_id) values (?, ?) USING TTL 2700';

/** All get queries **/
const GET_HASH_INFO = 'SELECT * FROM user_space.hash_to_email_id_map where unique_hash_string = ?';
const GET_USER_KEY_INFO = 'SELECT * from user_space.user_key_info where email_id = ?';


var clientConnector = dbConnector.getClientConnector('user_space');
var logger = loggerConf.getLogger();

if (!clientConnector) {
	throw new Error('cannot connect to cassandra cluster');
} else {
	clientConnector.execute('select * from user_space.user_primary_info limit 1', 
		function(err, result) {
			if (err) {
				logger.error(err);
				return;
			}
			console.log(result);
	});
}

/**
This method queries the DB to get data for @param username from user info table
@params username - emailid
@params userCallBack - callback passed over by caller async method
@returns - rows of users in user info table, which is ideally only one row
**/
function getUserAsync(username, userCallBack) {
	if (!username) {
		userCallBack('Invalid config call has been made', null);

	// TODO log an error
	if (!userCallBack)
		return;
	}

	async.waterfall([
		// this is dummy we can remove this code
		function initDummy(callback) {
			callback(null, username);
		},
		// this is the function which hits DB calls 
		function fetchUser(user, callback) {
			// check if the db connection is live to the module
			if (!clientConnector) 
				clientConnector = dbConnector.getClientConnector('user_space');

			clientConnector.execute('select * from user_space.user_primary_info where email_id = ?', [user], 
				function(err, result) {
					// exception with DB connection it should be notified
					// todo add a logger.
					if (err)
						return callback(err, null);

					return callback(null, result);
					
			});
		}], 
		function(err, result) {
			if(err) {
				return userCallBack(err, null);
			} 
		return userCallBack(null, result);
	});
};

/**
Method checks if the given hash key is present in hash key info table of the user
@params- hashkey to be checked which is taken from user key info table
@params - callback passed from the caller, which will be expecting true/false (i.e,) valid hash or not
**/
function checkHash(hashKey, callback) {
	if (!hashKey)
		return callback(null, false);

	// we are checking the connection here. DO WE NEED TO CHECK?  
	clientConnector.execute(GET_HASH_INFO, [hashKey], 
		function(err, result) {
			if (err)
				return callback(err, null);
			if (result && result.rowLength) 
				return callback(null, true, hashKey);
			else 
				return callback(null, false, null);
		});
};

/**
As the caller already knows that the username is exising in our system, we try to extract valid hash key
- check user key info table to get hash key, then check in hash key info table to check if the hash is present
- if the hash in db is valid, then we return, otherwise we create a new one 
@params - emailId
@params - userCallBack which is passed by the caller expecting a valid hash key
**/
function getHashKeyForExistingUser(userName, userCallBack) {
	console.log('Processing existing new user');
	if (!userName)
		return userCallBack('Exisitng user found, but no valid data found.', null);

	// process the request asynchronously
	aysnc.waterfall([
			function queryDb(callback) {
				clientConnector.execute(GET_USER_KEY_INFO, [userName], 
					function(err, result) {
						if (err) 
							return callback(err, null);

						// check if there is a row exist
						if (result && result.rowLength) {
							var hashKey = result.rows[0]["unique_hash_string"];
							// check if the hash in table is the corrent one
							return checkHash(hashKey, callback);
						} else {
							// ideally the code shouln't be here at all. 
							// TODO log an error
							return callback('Data inconsistent! User information is missing in user key info', null);
						}
					});
			}, function getValidHash(isValid, hashKey, callback) {
				if (isValid) {
					// send the hash key to exit function of async that can be passed over to the caller of this function
					return callback(null, hashKey);
				} else {
					// this call will return the new hash key to the callback function
					return keyGen.getHashKeyForUserWithCallBack(userName, callback);
				}
			}], function(err, result) {
				if (err) 
					return userCallBack(err, null);
				// here result is nothing but the hashkey
				return userCallBack(null, result);
			});	
};



module.exports = {

	getUserAsync : getUserAsync,

	checkHash : checkHash, 

	getHashKeyForExistingUser :  getHashKeyForExistingUser,

	processExistingNewUser : function(userName, callback) {
		console.log('Processing existing new user');

		if (!userName)
			return userCallBack('Exisitng user found, but no valid data found.', null);
		aysnc.waterfall([
			function queryDb(callback) {
				clientConnector.execute(GET_USER_KEY_INFO, [userName], 
					function(err, result) {
						if (err) 
							return callback(err, null);

						// check if there is a row exist
						if (result && result.rowLength) {
							var hashKey = result.rows[0]["unique_hash_string"];
							return checkHash(hashKey, callback);
							//return callback(null, hashKey);
						} else {
							return callback(null, false, null);
							//return keyGen.getHashKeyForUserWithCallBack(userName, callback);
						}
					});
			}, function getValidHash(isValid, hashKey, callback) {
				if (isValid) {
					// send an updated mail saying the user already exist
					
				} else {
					return keyGen.getHashKeyForUserWithCallBack(userName, callback);
				}
			}
			function getValidHash(hashKey, callback) {
				if (!hashKey)
					return callback('Invalid request of hash key to process', null);

				// clientConnector.batch();
			}
			]);
	},

	createNewUser : function(fields, userCallBack) {
		if (!fields || !userCallBack) {
			return userCallBack('Invalid user info provided to proceed with user creation', null);
		}

		async.waterfall([
			function checkIfUserExistInPrimaryInfo(callback) {
				getUserAsync(fields['email-id'], callback);
			},
			function filterUsersObtained(users, callback) {
				var isUserExist = false;
	        	if (users && users.rowLength) {
	        		for(var iter = 0; iter< users.rowLength; iter++) {
	                    if (users.rows[iter]["user_active"]) {
	                        isUserExist = true;
	                    }
	            	}
	        	}
	        	if (isUserExist) {
	        		callback(null, true);
	        	} else {
	        		callback(null, false);
	        	}
			}, function insertQueriesInBatch(isUserExist, callback) {
				var queriesTobeExecuted = [];
				var iter=0;
				if(isUserExist) {
					queriesTobeExecuted[iter++] = { 
						query: UPDATE_PRIMARY_USER_ACTIVE, 
						params : [fields['email-id']]};
				} else {
					queriesTobeExecuted[iter++] = { 
						query: INSERT_PRIMARY_USER_INFO, 
						params : [
						fields['email-id'],
						fields['merchant-name'],
						fields['1'],
						fields['first-name'],
						fields['last-name'],
						'', 
						fields['phone-number'],
						false
						]};
				}
				queriesTobeExecuted[iter++] = {
					query: INSERT_KEY_USER_INFO,
					params : [
					fields['email-id'],
					new Date(),
					true,
					true,
					fields['hash-key'],
					fields['hash-key']
					]
				};
				queriesTobeExecuted[iter++] = {
					query: INSERT_HASH_INFO,
					params : [
					fields['hash-key'],
					fields['email-id']
					]
				}
				console.log('queries going to be execute in batch');
				console.log(queriesTobeExecuted);
				clientConnector.batch(queriesTobeExecuted, {prepare : true}, function(err) {
					if (err) {
						console.log('exception occured in batch statement');
						logger.error('Exception occured creating user in batch');
						logger.error(err);
						return callback('Unable to create user', null);
					}
					// sucessfully executed 
					return callback(null, true);
				});
			}
			], function(err, result) {
				console.log('Final callback');
				if (err) 
					return userCallBack(null, false);
				if (result)
					return userCallBack(null, true);
				return userCallBack(null, false);
		})
	},
	checkIfUserKeyInfoActive : function(username, userCallBack) {
		if (!username || !userCallBack) {
			userCallBack('Invalid config call has been made', null);
		}
	},
	checkUserFirstTimeKey : function(formFields) {
		
	}
}



