var BootUtil = function() {

	var instance;

	function instantiateUtil() {
		var object = new BootUtil();
		return object;
	}

	return {

		getBootUtil : function() {
			if(!instance) {
				instance = instantiateUtil();
				instance.constructor = null;
			}
			return instance;
		},

		normalizePort : function(portNo) {
			var port = parseInt(val, 10);
			if (isNaN(portNo)) { 
				return val;
			}
			if (port >= 0) {
				this.portUsed = 
				return port;
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
			var addr = server.address();
			var bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port;
			debug('Listening on ' + bind);
		}
	};

}();