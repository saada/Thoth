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


var net = require('net'),
    WebSocketServer = require('ws').Server,

    wsServer, target_host, target_port;

var targets = [];
connectVNC = function(socket, target_port, target_host)
{
    // START VNC CONNECTION
    target = net.createConnection(target_port, target_host, function() {
        console.log('connected to target');

        socket.on('message', function(msg) {
            // var firstByte = buf[0];
            // if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
            if (socket.protocol === 'base64') {
                target.write(new Buffer(msg, 'base64'));
            } else {
                // console.log("receive message from client: "+ msg);
                target.write(msg, 'binary');
            }
        });
    });
    target.on('error', function(err) {
        console.log("Target Error: ", err.code);
    });
    target.on('data', function(data) {
        // console.log("receive mesage from vnc: " + data);
        try {
            if (socket.protocol === 'base64') {
                socket.send(new Buffer(data).toString('base64'));
            } else {
                socket.send(data, {
                    binary: true
                });
            }
        } catch (e) {
            console.log("Client closed, cleaning up target");
            target.end();
        }
    });
    target.on('end', function() {
        console.log('target disconnected');
        socket.close();
    });
    //console.log('got message: ' + msg);
};

authSocket = function(socket){
    var reqCookie = socket.upgradeReq.headers.cookie;
    var cookies = {};
    reqCookie && reqCookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    console.log(cookies);
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
        connectVNC(client, target_port, target_host);
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

exports.listen = function(webServer) {
    wsServer = new WebSocketServer({
        server: webServer,
        handleProtocols: selectProtocol
    });
    wsServer.on('connection', new_client);
};