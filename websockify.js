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

var vncConnection = require('./vncController');

var WebSocketServer = require('ws').Server,
    sessionStore, express, wsServer, target_host, target_port;

// All available vms
var VMs = {
    "user1-vm1":{ip:"10.0.2.166", conns:[]},
    "user1-vm2":{ip:"10.0.2.136", conns:[]},
    "user1-vm3":{ip:"10.0.2.165", conns:[]},
    "user2-vm1":{ip:"10.0.2.174", conns:[]},
    "user2-vm2":{ip:"10.0.2.173", conns:[]},
    "user2-vm3":{ip:"10.0.2.175", conns:[]},
    "user3-vm1":{ip:"10.0.2.167", conns:[]},
    "user3-vm2":{ip:"10.0.2.169", conns:[]},
    "user3-vm3":{ip:"10.0.2.168", conns:[]},
    "user4-vm1":{ip:"10.0.2.171", conns:[]},
    "user4-vm2":{ip:"10.0.2.170", conns:[]},
    "user4-vm3":{ip:"10.0.2.172", conns:[]}
};

removeFromArray = function(arr, obj){
    index = arr.indexOf(obj);
    if(index > -1)
        arr.splice(index, 1);
};

getSessionUsername = function(socket){
    var reqCookie = socket.upgradeReq.headers.cookie;   // TRY TO LOOK FOR HANDSHAKE INSTEAD
    var parsedCookie = require('cookie').parse(reqCookie);
    var signedCookie = require('connect').utils.parseSignedCookies(parsedCookie,'monkey');
    var json = JSON.parse(signedCookie['connect.sess'].slice(2));
    var username = json['username'];
    console.log(username);
    return username;
};

authSocket = function(socket){
    var username = getSessionUsername(socket);
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
new_socket = function(socket) {
    var path = socket.upgradeReq.url;
    var socketAddr = socket._socket.remoteAddress,
        log;
    log = function(msg) {
        console.log(' ' + socketAddr + ': ' + msg);
    };
    console.log('WebSocket connection');
    console.log('Version ' + socket.protocolVersion + ', subprotocol: ' + socket.protocol);

    if (authSocket(socket)) {
        target_port = "5901";
        if(VMs[path.substring(1)]){
            targetVM = VMs[path.substring(1)];
            target_host = targetVM.ip;
        }

        else {
            targetVM = VMs["user4-vm3"];
            target_host = targetVM.ip;
        }

        socket.vnc = new vncConnection(socket, target_port, target_host).target;
        targetVM.conns.push(getSessionUsername(socket));
        console.log("connected targets: ",targetVM.conns.length);
        console.log(VMs);
    }
    else
        socket.close();

    socket.on('close', function(code, reason) {
        console.log('WebSocket socket disconnected: ' + code + ' [' + reason + ']');
        removeFromArray(targetVM.conns, getSessionUsername(socket));
        if(socket.vnc){
            socket.vnc.end();
            delete socket.vnc;
        }
        console.log("connected targets: ",targetVM.conns.length);
    });
    socket.on('error', function(a) {
        console.log('WebSocket socket error: ' + a);
        removeFromArray(targetVM.conns, getSessionUsername(socket));
        if(socket.vnc){
            socket.vnc.end();
            delete socket.vnc;
        }
        console.log("connected targets: ",targetVM.conns.length);
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
        console.log("socket must support 'binary' or 'base64' protocol");
        callback(false);
    }
};

var Class = function(web) {
    sessionStore = web.sessionStore;
    wsServer = new WebSocketServer({
        server: web.server,
        // port:web,
        handleProtocols: selectProtocol
    });
    wsServer.on('connection', new_socket);
    this.server = wsServer;

    console.log('Websockify server running on port %d...', web.server.address().port);
};

// exports
module.exports = Class;