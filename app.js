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
console.log('Web server and socket.io running on port %d...',conf.HTTP_PORT);

// Launch websock
// ws.listen(conf.WEBSOCKET_PORT);
ws.listen(web.server);	// here websock looks for the '.server' property
console.log('websock running on port %d...',conf.WEBSOCKET_PORT);

// Launch webRTC
webRTC.listen(conf.WEBRTC_PORT);
console.log('WebRTC server running on port %d...',conf.WEBRTC_PORT);