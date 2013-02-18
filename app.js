// add the express framework
var express = require('express'),
    app  = express(),
  server = require('http').createServer(app),
      io = require('socket.io').listen(server),
  webRTC = require('webrtc.io'),
  routes = require('./routes');

// Config
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', routes.index);
app.get('/chat', routes.chat);

app.use(app.router);
app.use(express.static(__dirname + '/public'));

// create the http server and listen on port
server.listen(3000);
console.log('Web server and socket.io running on port 3000...');

webRTC.listen(4000);
console.log('WebRTC server running on port 4000...');
// This callback function is called every time a socket
// tries to connect to the server
io.sockets.on('connection', function(socket) {
    console.log("ALL ROOMS:");
    console.log(io.sockets.manager.rooms);
    console.log((new Date()) + ' Connection established.');
    socket.broadcast.emit('news', { babe: 'babe' });

    // When a user send a SDP message
    // broadcast to all users in the room
    socket.on('message', function(message) {
        console.log((new Date()) + ' Received Message, broadcasting: ' + message);
        socket.broadcast.emit('message', message);
    });

    // When the user hangs up
    // broadcast bye signal to all users in the room
    socket.on('disconnect', function() {
        // close user connection
        console.log((new Date()) + " Peer disconnected.");
        socket.broadcast.emit('user disconnected');
    });

});