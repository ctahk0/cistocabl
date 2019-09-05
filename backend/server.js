#!/usr/bin/env node
// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config();
// }
require('dotenv').config();
var app = require("./app");
var debug = require("debug")("cistoca_backend:server");
var http = require("http");
var fs = require('fs');
// const db = require('./api/util/database');
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || "8000");
app.set("port", port);
/** 
 * Get certificate
*/
// var privateKey  = fs.readFileSync(' /etc/letsencrypt/live/codeready.site/privkey.pem', 'utf8');
// var certificate = fs.readFileSync(' /etc/letsencrypt/live/codeready.site/cert.pem', 'utf8');

// var credentials = {key: privateKey, cert: certificate};
/**
 * Create HTTP server.
 */
var server = http.createServer(app);
/**
 * Listen on provided port, on all network interfaces.
 */
// server.timeout = 0;

server.listen(port, function () {
  console.log('Server listening on port', port);
});
server.on("error", onError);
server.on("listening", onListening);

/* function keepAlive() {
  db.execute('SELECT 1').then(result => {
    const now = new Date();
    console.log('pong', now.toISOString());
  }).catch(err => {
    console.log('GRESKA U keepAlive funkciji', err);
  });
}
setInterval(keepAlive, 300000); */

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
