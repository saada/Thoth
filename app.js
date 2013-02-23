/*
@================================================================================
@= WEBSOCK STUFF
@================================================================================
*/
var websock = require('websock'),
        net = require('net');
// instead of 80 we could also parse a server to listen to
websock.listen(80, function(socket) {
    var vncSocket = net.createConnection("5901", "10.0.1.247");
    vncSocket.on('data', function(data) {
          //console.log('RECV FROM VNC:' + data);
          //console.log('SEND TO CLIENT:' + new Buffer(data).toString('base64'));
          //console.log(data);
          //console.log(data.length + ":" + data.toString('base64').length + "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
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
    socket.on('message', function(message) {
        //console.log('RECV FROM CLIENT:' + message);
        var buf = new Buffer(message, 'base64');
        var firstByte = buf[0];
        if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
          vncSocket.write(buf);
          //console.log('SEND TO VNC:' + new Buffer(message, 'base64'));
        }
    });
});