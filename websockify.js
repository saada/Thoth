// A WebSocket to TCP socket proxy
// Copyright 2012 Joel Martin
// Licensed under LGPL version 3 (see docs/LICENSE.LGPL-3)

// Known to work with node 0.8.9
// Requires node modules: ws, optimist and policyfile
//     npm install ws optimist policyfile
//
// NOTE: 
// This version requires a patched version of einaros/ws that supports
// subprotocol negotiation. You can use the patched version like this:
// 
//     cd websockify/other
//     git clone https://github.com/kanaka/ws
//     npm link ./ws


var WebSocketServer = require('ws').Server,

    sessionStore, express, wsServer, target_host, target_port;

var targets = [];

authSocket = function(socket){
    var reqCookie = socket.upgradeReq.headers.cookie;   // TRY TO LOOK FOR HANDSHAKE INSTEAD
    var parsedCookie = require('cookie').parse(reqCookie);
    var signedCookie = require('connect').utils.parseSignedCookies(parsedCookie,'monkey');
    var json = JSON.parse(signedCookie['connect.sess'].slice(2));
    var user = json['user'];
    console.log(user);
    // sessionStore.get(json, function(err, session) {console.log(session);
    //     if (err || !session) console.log('websockify: no found session.', false);
    //     socket.session = session;
    //     if (socket.session.user) {
    //       console.log(null, true);
    //     } else {
    //       console.log('websockify: no found session.user', false);
    //     }
    // });
    // if(memoryStore contains this sessionId)
    return true;
};

// Handle new WebSocket client
new_client = function(client) {
    var clientAddr = client._socket.remoteAddress,
        log;
    log = function(msg) {
        console.log(' ' + clientAddr + ': ' + msg);
    };
    console.log('WebSocket connection');
    console.log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

    if (authSocket(client)) {
        target_port = "5901";
        target_host = "10.0.2.164";
        require('./vncController').connectVNC(client, target_port, target_host);
    }
    else
        client.close();

    client.on('close', function(code, reason) {
        console.log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        target.end();
    });
    client.on('error', function(a) {
        console.log('WebSocket client error: ' + a);
        target.end();
    });
};

// Select 'binary' or 'base64' subprotocol, preferring 'binary'
selectProtocol = function(protocols, callback) {
    var plist = protocols ? protocols.split(',') : "";
    plist = protocols.split(',');
    if (plist.indexOf('binary') >= 0) {
        callback(true, 'binary');
    } else if (plist.indexOf('base64') >= 0) {
        callback(true, 'base64');
    } else {
        console.log("Client must support 'binary' or 'base64' protocol");
        callback(false);
    }
};

exports.listen = function(web) {
    sessionStore = web.sessionStore;
    wsServer = new WebSocketServer({
        server: web.server,
        handleProtocols: selectProtocol
    });
    wsServer.on('connection', new_client);
};