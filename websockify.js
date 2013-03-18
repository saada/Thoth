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
connectVNC = function(target_port, target_host)
{

};

// Handle new WebSocket client
new_client = function(client) {
    var clientAddr = client._socket.remoteAddress,
        log;
    log = function(msg) {
        console.log(' ' + clientAddr + ': ' + msg);
    };
    log('WebSocket connection');
    log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

    var reqCookie = client.upgradeReq.headers.cookie;
    var cookies = {};
    reqCookie && reqCookie.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    console.log(cookies);
    // if(memoryStore contains this sessionId)
    if (reqCookie) {

        // START VNC CONNECTION
        target_port = "5901";
        target_host = "10.0.2.164";

        target = net.createConnection(target_port, target_host, function() {
            log('connected to target');

            client.on('message', function(msg) {
                // var firstByte = buf[0];
                // if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
                if (client.protocol === 'base64') {
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
            // log("receive mesage from vnc: " + data);
            try {
                if (client.protocol === 'base64') {
                    client.send(new Buffer(data).toString('base64'));
                } else {
                    client.send(data, {
                        binary: true
                    });
                }
            } catch (e) {
                log("Client closed, cleaning up target");
                target.end();
            }
        });
        target.on('end', function() {
            log('target disconnected');
            client.close();
        });
        //log('got message: ' + msg);
    }
    else
        client.close();

    

    client.on('close', function(code, reason) {
        log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
        target.end();
    });
    client.on('error', function(a) {
        log('WebSocket client error: ' + a);
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