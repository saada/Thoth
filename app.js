console.log('+      o     +              o   ');
console.log('    +             o     +       +');
console.log('o          +');
console.log('    o  +           +        +');
console.log('+        o     o       +        o');
console.log('-_-_-_-_-_-_-_,------,      o ');
console.log('_-_-_-_-_-_-_-|   /\\_/\\  ');
console.log('-_-_-_-_-_-_-~|__( ^ .^)  +     +  ');
console.log('_-_-_-_-_-_-_-""  ""      ');
console.log('+      o         o   +       o');
console.log('    +         +');
console.log('o        o         o      o     +');
console.log('    o           +');
console.log('+      +     o        o      +    ');




/*
@================================================================================
@= MAIN APP
@================================================================================
*/

// Custom Modules
var conf   = require('./config');
var web = require('./webserver');

// Module dependencies
var io   = require('socket.io').listen(web.server);
var webRTC  = require('webrtc.io');
var websock = require('websock');
var net     = require('net');

// launch web server
web.server.listen(conf.HTTP_PORT,function(){
  if (process.argv[2] == '-o')  //launch browser
    require('open')('http://localhost:'+conf.HTTP_PORT);
  else
    console.log("~# You could pass '-o' to open localhost on a browser #~");
});
console.log('Web server and socket.io running on port %d...',conf.HTTP_PORT);

webRTC.listen(conf.WEBRTC_PORT);
console.log('WebRTC server running on port %d...',conf.WEBRTC_PORT);

/*
@================================================================================
@= WEBSOCK STUFF
@================================================================================
*/
console.log('websock running on port %d...',conf.WEBSOCKET_PORT);
websock.listen(conf.WEBSOCKET_PORT, function(socket) {
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
            console.log('SEND TO VNC:' + new Buffer(message, 'base64'));
          // }
          vncSocket.write(buf);
        }
        else
        {
          socket.close();
        }
    });
});

