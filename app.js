/*
@================================================================================
@= WEBSERVER STUFF
@================================================================================
*/

// CONSTANTS
var HTTPSERVER_PORT = 8000;
var WEBRTC_PORT = 4000;
var WEBSOCKET_PORT = 80;

// add the express framework
var express = require('express'),
    app  = express(),
  server = require('http').createServer(app),
      // io = require('socket.io').listen(server),
  webRTC = require('webrtc.io'),
  routes = require('./routes');

// Config
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
app.use(express.cookieParser('aoeiwhvoiwehfaowe'));
app.use(express.cookieSession({cookie:{httpOnly: false}})); //allows client-side JS to access the session id
app.use(app.router);

app.get('/', routes.index);
app.get('/chat', checkAuth, routes.chat);
app.post('/login', routes.login);
app.get('/logout', routes.logout);


//app.use(express.bodyParser());

// create the http server and listen on port
server.listen(HTTPSERVER_PORT);
console.log('Web server and socket.io running on port %d...',HTTPSERVER_PORT);

webRTC.listen(WEBRTC_PORT);
console.log('WebRTC server running on port %d...',WEBRTC_PORT);

/*
@================================================================================
@= WEBSOCK STUFF
@================================================================================
*/
var websock = require('websock'),
        net = require('net');
console.log('websock running on port %d...',WEBSOCKET_PORT);
websock.listen(WEBSOCKET_PORT, function(socket) {
  console.log("Got connection from socket: "+socket.address); //socket ip address
  socket.state = 'unAuth';
  // socket.state = 'Auth';
        var vncSocket;
    socket.on('close',function(){console.log('Socket closed...')});
    socket.on('message', function(message) {
        //console.log('RECV FROM CLIENT:' + (new Buffer(message, 'base64')).toString());
        if(socket.state == "unAuth")
        {
          var sessionMessage = new Buffer(message, 'base64');
          sessionId = sessionMessage.toString();
          console.log("Session id received is: "+sessionId);
          // if(memoryStore contains this sessionId)
          if(true)
          {
            // buf = new Buffer(1);
            // buf.writeUInt8(1, 0);
            // socket.state = "Auth";
            // socket.send(buf.toString('base64'));
            socket.state = "Auth";
            // START VNC CONNECTION
            vncSocket = net.createConnection("5901", "10.0.1.247");
            vncSocket.on('data', function(data) {
                  //console.log('RECV FROM VNC:' + data);
                  //console.log('SEND TO CLIENT:' + new Buffer(data).toString('base64'));
                  // console.log(data);
                  // console.log(data.length + ":" + data.toString('base64').length + "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                  var sendData = data.toString('base64');
                  if (sendData.length > 65535) {
                    var bufLen = Math.floor(data.length / 2);
                    var buf = data.slice(0, bufLen);
                    socket.send(buf.toString('base64'));
                    var buf2 = data.slice(bufLen, data.length);
                    socket.send(buf2.toString('base64'));
                  } else {
                    socket.send(sendData);
                  }
            }).on('connect', function() {
            }).on('end', function() {
              console.log('END');
            });
          }
          else
          {
            arr = [];
            arr.push(0);
            buf = new Buffer(arr);
            socket.send(buf.toString('base64'));
          }
        }
        else if (socket.state == "Auth")
        {
          var buf = new Buffer(message, 'base64');
          // var firstByte = buf[0];
          // if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
          //   vncSocket.write(buf);
          //   //console.log('SEND TO VNC:' + new Buffer(message, 'base64'));
          // }
          vncSocket.write(buf);
        }
        else
        {
          socket.close();
        }
        
    });
});

/*
@================================================================================
@= CheckAuth function
@================================================================================
*/
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

