var clusterHandler = require('cassandra-driver');
var async = require('async');
var clientConnector = null;
var path = require('path');
var loggerConf = require(path.join(__dirname, '/context-utils/', 'logger-conf'));
var logger = loggerConf.getLogger();
/**
contains the pool of connectiosn to the different keyspaces in cassandra
**/
var poolOfConnections = {
	"user_space": null,
	"system_auth" : null,
};

/**
can tbe choosen randomly for connection to the cluster
TODO later on use LB to load balancing
**/ 
var connectorPools = {
	"connector1": {
		"connectorConf" : {},
		"connector" : null
		},
	"connector2" : {
		"connectorConf" : {},
		"connector" : null
		},
	"connector3" : {
		"connectorConf" : {},
		"connector" : null
		}
};

/**
Private util method specifc to driver initializtions
**/

function initializeConnection() {
	clientConnector = new clusterHandler.Client({contactPoints: ['127.0.0.1'], keyspace: 'user_space', protocalOptions : {port: '9041'}});
	clientConnector.connect(function(err) {
		logger.error(err);	
	});
	if (clientConnector == null) {
		logger.error('Unable to initialize connection to cassandra cluster.');
		console.log('Unable to connect to cluster.');
	}
	connectionTest();
}

function connectionTest() {
	/* const queryStr = "select * from system_auth.roles;";
	clientConnector.execute(queryStr, function (err, result) {
		console.log(result);
		//console.log(user);
		console.log(err);
	}); */
}
 
module.exports = {
	getClientConnector : function() {
		if (!clientConnector) 
			initializeConnection();
		return clientConnector;
	}
};