var dbConnector = require('../utils/database-connector');
var loggerConf = require('../utils/context-utils/logger-conf');
var async = require('async');

const INSERT_PRIMARY_USER_INFO = 'INSERT into user_space.user_primary_info (email_id, company_name, country_pin, first_name, last_name, '
 		+ 'middle_name, phone_number, user_active) values (?, ?, ?, ?, ?, ?, ?, ?)';
const UPDATE_PRIMARY_USER_ACTIVE = 'UPDATE user_space.user_primary_info set  user_active = true WHERE email_id = ?';
const INSERT_KEY_USER_INFO = 'INSERT into user_space.user_key_info (email_id, generated_timestamp, is_active, '
		+ 'is_first_time, pass, unique_hash_string) values (?, ?, ?, ?, ?, ?)';
		// this should die in 45 minutes
const INSERT_HASH_INFO = 'INSERT into user_space.hash_to_email_id_map (unique_hash_string, email_id) values (?, ?) USING TTL 2700';

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

function getUserAsync(username, userCallBack) {
	if (!username || !userCallBack) {
		userCallBack('Invalid config call has been made', null);
	}

	async.waterfall([
		function initDummy(callback) {
			callback(null, username);
		}, function fetchUser(user, callback) {
			if (!clientConnector) 
				clientConnector = dbConnector.getClientConnector('user_space');

			clientConnector.execute('select * from user_space.user_primary_info where email_id = ?', [user], 
				function(err, result) {
					if (err)
						return callback(err, null);

					return callback(null, result);
					
			});
		}], function(err, result) {
		if(err) {
			return userCallBack(err, null);
		} 
		return userCallBack(null, result);
	});
};



module.exports = {

	getUserAsync : getUserAsync, 

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
	}
}



