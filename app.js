// create the http server and listen on port
var server = require('http').createServer();
var app = server.listen(1337, function() {
  console.log((new Date()) + " Server is listening on port 1337");
});

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