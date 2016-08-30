var logModule = require('winston');
var logger = null;

function initializeLogger() {
	logModule.add(logModule.transports.File, { filename: 'samelogger.log' });
	logModule.remove(logModule.transports.Console);
	logModule.level = 'info';
	logger = logModule;
};

module.exports = {
	getLogger : function() {
		if(logger == null) {
			initializeLogger();
		}
		logger.info('intialized logger');
		return logger;
	}
}
