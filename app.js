// create the http server and listen on port
var http = require('http');
var app = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('VLAB IS RUNNING...\n');
}).listen(3000, 'localhost');

console.log('Server running at http://localhost:3000/');

// create the peer server
var PeerServer = require('peer').PeerServer;
var server = new PeerServer({ port: 9000 });

// create the socket server on the port
var io = require('socket.io').listen(app);


// This callback function is called every time a socket
// tries to connect to the server
io.sockets.on('connection', function(socket) {

    console.log((new Date()) + ' Connection established.');

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