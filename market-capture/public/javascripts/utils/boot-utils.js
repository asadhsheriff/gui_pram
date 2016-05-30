module.exports = { 

	normalizePort : function(portNo) {
		var port = parseInt(portNo, 10);
		if (isNaN(portNo)) { 
			return val;
		}
		
		return false;
	},

	onError : function(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

		  // handle specific listen errors with friendly messages
		  switch (error.code) {
		  	case 'EACCES':
		  	console.error(bind + ' requires elevated privileges');
		  	process.exit(1);
		  	break;
		  	case 'EADDRINUSE':
		  	console.error(bind + ' is already in use');
		  	process.exit(1);
		  	break;
		  	default:
		  	throw error;
		  }
	},

	onListening : function() {
		/**
		var addr = server.address();
		var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
		debug('Listening on ' + bind);
		*/
	}
};