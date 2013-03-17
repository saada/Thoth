/*
@================================================================================
@= WEBSOCK
@================================================================================
*/

var websock = require('websock');
var net     = require('net');
exports.listen = function(port) {
  var sockets = [];
  websock.listen(port, function(socket) {
    console.log("Got connection from socket: " + socket.address); //socket ip address
    sockets.push(socket);
    console.log("# of sockets: " + sockets.length);
    socket.state = 'unAuth';
    // socket.state = 'Auth';
    var vncSocket;
    socket.on('close', function() {
      console.log('Socket closed...');
      sockets.splice(sockets.indexOf(socket), 1);
      console.log("# of sockets: " + sockets.length);
    });
    socket.on('message', function(message) {
      //console.log('RECV FROM CLIENT:' + (new Buffer(message, 'base64')).toString());
      if (socket.state == "unAuth") {
        var sessionMessage = new Buffer(message, 'base64');
        sessionId = sessionMessage.toString();
        console.log("Session id received is: " + sessionId);
        // if(memoryStore contains this sessionId)
        if (true) {
          // buf = new Buffer(1);
          // buf.writeUInt8(1, 0);
          // socket.state = "Auth";
          // socket.send(buf.toString('base64'));
          socket.state = "Auth";
          // START VNC CONNECTION
          vncSocket = net.createConnection("5901", "10.0.2.164");
          // vncSocket = net.createConnection("1", "192.168.2.79");
          vncSocket.on('error',function(err){console.log("VNCSOCKET Error: ",err.code);});
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
          }).on('connect', function() {}).on('end', function() {
            console.log('END');
          });
        } else {
          arr = [];
          arr.push(0);
          buf = new Buffer(arr);
          socket.send(buf.toString('base64'));
        }
      } else if (socket.state == "Auth") {
        var buf = new Buffer(message, 'base64');
        // var firstByte = buf[0];
        // if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
        //   vncSocket.write(buf);
        console.log('SEND TO VNC:' + new Buffer(message, 'base64'));
        // }
        vncSocket.write(buf);
      } else {
        socket.close();
      }
    });
  });
};