// add the express framework
var app = require('express')(),
  server = require('http').createServer(app),
      io = require('socket.io').listen(server),
      routes = require('./routes');

// Config
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', routes.index);
app.get('/chat', routes.chat);

// create the http server and listen on port
server.listen(3000);
console.log('Web server running on port 3000...');

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