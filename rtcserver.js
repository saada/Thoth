module.exports.listen = function listen(port){
  var app = require('express')();
  var server = require('http').createServer(app);
  var webRTC = require('webrtc.io').listen(server);
  
  server.listen(port);
  console.log('WebRTC server running on port %d...', port);


  webRTC.rtc.on('chat_msg', function(data, socket) {
    var roomList = webRTC.rtc.rooms[data.room] || [];

    for (var i = 0; i < roomList.length; i++) {
      var socketId = roomList[i];

      if (socketId !== socket.id) {
        var soc = webRTC.rtc.getSocket(socketId);

        if (soc) {
          soc.send(JSON.stringify({
            "eventName": "receive_chat_msg",
            "data": {
              "messages": data.messages,
              "color": data.color
            }
          }), function(error) {
            if (error) {
              console.log(error);
            }
          });
        }
      }
    }
  });
};
