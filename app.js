console.log('    o  +           +        +');
console.log('+        o     o       +        o');
console.log('-_-_-_-_-_-_-_,-----------------,      o ');
console.log('_-_-_-_-_-_-_-| STARTING... /\\_/\\  ');
console.log('-_-_-_-_-_-_-~|____________( ^ .^)  +     +  ');
console.log('_-_-_-_-_-_-_-""            ""      ');
console.log('+      o         o   +       o');
console.log('    +         +');
console.log('o        o         o      o     +\n');

/*
@================================================================================
@= MAIN APP
@================================================================================
*/
// db = require('./db/db').db();
// Custom Modules
var conf   = require('./config');
var httpServer = require('./webserver');
var ws = require('./websockify');

// Module dependencies
var webRTC  = require('webrtc.io');

// launch web server
var webServer = new httpServer(conf.PORTS.WEBSERVER);
console.log('HTTP server running on port %d...',conf.PORTS.WEBSERVER);

// Launch websockify
var wsServer = new ws(webServer);	// upgrade http to websocket
console.log('Websockify server running on port %d...',conf.PORTS.WEBSERVER);

// Launch webRTC
var httpRTC = new httpServer(conf.PORTS.WEBRTC);
webRTC.listen(httpRTC.server);
console.log('WebRTC server running on port %d...',conf.PORTS.WEBRTC);