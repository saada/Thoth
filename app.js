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
// GLOBAL.db = require('./db/db');
// Custom Modules
var conf   = require('./config');
var web = require('./webserver');
// var ws = require('./websockets');
var ws = require('./websockify');

// Module dependencies
// var io   = require('socket.io').listen(web.server);
var webRTC  = require('webrtc.io');

// launch web server
web.listen(conf.HTTP_PORT);
console.log('HTTP server running on port %d...',conf.HTTP_PORT);

// Launch websock
ws.listen(web);	// upgrade http to websocket
console.log('Websockify server running on port %d...',conf.HTTP_PORT);

// Launch webRTC
var web2 = require('./webserver2');
web2.listen(4000);
webRTC.listen(web2.server);
console.log('WebRTC server running on port %d...',4000);