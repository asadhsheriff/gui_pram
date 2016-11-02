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
	"user_space": {
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
	clientConnector.execute('select * from user_space.user_primary_info limit 1', 
		function(err, result) {
			if (err) {
				logger.error(err);
				return;
			}
			console.log(result);
	});
}
 
module.exports = {
	getClientConnector : function(schema_space) {
		if (!clientConnector) 
			initializeConnection();
		return clientConnector;
	},
};