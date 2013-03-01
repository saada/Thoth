/*
@================================================================================
@= WEBSERVER STUFF
@================================================================================
*/

// CONSTANTS
var   HTTP_PORT = 8000,
    WEBRTC_PORT = 4000,
 WEBSOCKET_PORT = 80;

/**
 * Module dependencies.
 */
var express = require('express'),
app         = express(),
server      = require('http').createServer(app),
path        = require('path'),
open        = require('open'),
// io       = require('socket.io').listen(server),
webRTC      = require('webrtc.io'),
routes      = require('./routes'),
websock     = require('websock'),
net         = require('net');

// Config
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.cookieSession({cookie:{httpOnly: false}})); //allows client-side JS to access the session id
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.get('/chat', checkAuth, routes.chat);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.use(routes.bad);

// create the http server and listen on port
server.listen(HTTP_PORT);
console.log('Web server and socket.io running on port %d...',HTTP_PORT);
open('http://localhost:'+HTTP_PORT);

webRTC.listen(WEBRTC_PORT);
console.log('WebRTC server running on port %d...',WEBRTC_PORT);

/*
@================================================================================
@= WEBSOCK STUFF
@================================================================================
*/
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

