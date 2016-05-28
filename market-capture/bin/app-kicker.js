/**
 This module kick starts the application server on express with necessary environments
 being set at app level

 app-kicker.js
 @author ashu
**/

// initialize environment to kick start application
var app = require('../boot-app');
var debug = require('debug')('market-capture:server');
var http = require('http');


// lets start the server after some validations

// port validations
var bootUtil = BootUtil.getBootUtil();
var port = bootUtil.normalizePort(process.env.PORT || APP_HOST_PORT);
// set environment level app port
app.set('port', port);

console.log(bootUtil);

/**
 * Create HTTP server.
 */
var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port);
server.on('error', bootUtil.onError);
server.on('listening', bootUtil.onListening);