var generator = require('password-generator');

function generateHash() {
	var randomLength = Math.floor(Math.random() * (60 - 16)) + 16;
	//var hashString = generator(randomLength, false, /[\d\W\w\p]/);
	var hashString = generator(randomLength, false);
	return hashString
};

/**
Method gets the hash and validates with DB if its persent. If no, return other wise recursively call this
@params hashKey - hash to be validated 
@params callback - 
**/
function validateHash(hashKey, clrCallBack) {

};

function getValidHash(clrCallBack) {
	var hashKey = generateHash();
	
};

module.exports = {

	// TODO enhance the funciton to take user related info to generate based on user information
	generateHash : generateHash,

	validateHash : validateHash,

	getValidHash : getValidHash,

	getHashKeyForUserWithCallBack : function(userName, callback) {
	var hashKey = generateHash();
	connector.execute("select * from user_space.hash_to_email_id_map where unique_hash_string = ? ", [hashKey], 
		function (err, result) {
			if (err) {
				return callback(err, null);
			}
			if (result.rowLength) {
				// there is one row active, so we cannot use that hash, we need a new hash
				return getHashKeyForUserWithCallBack(userName, callback);
			} else {
				// unique key is generated, proceed with work
				callback(null, hashKey);
			}
	});
	return;
}

};