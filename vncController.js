net = require('net');
// GLOBAL.db

exports.connectVNC = function(socket, target_port, target_host) {
	// START VNC CONNECTION
	target = net.createConnection(target_port, target_host, function() {
		console.log('connected to target');

		socket.on('message', function(msg) {
			// var firstByte = buf[0];
			// if (firstByte != 4 && firstByte != 5 && firstByte != 6) {
			if (socket.protocol === 'base64') {
				target.write(new Buffer(msg, 'base64'));
			} else {
				// console.log("receive message from client: "+ msg);
				target.write(msg, 'binary');
			}
		});
	});
	target.on('error', function(err) {
		console.log("Target Error: ", err.code);
		target.end();
	});
	target.on('data', function(data) {
		// console.log("receive mesage from vnc: " + data);
		try {
			if (socket.protocol === 'base64') {
				socket.send(new Buffer(data).toString('base64'));
			} else {
				socket.send(data, {
					binary: true
				});
			}
		} catch (e) {
			console.log("Client closed, cleaning up target");
			target.end();
		}
	});
	target.on('end', function() {
		console.log('target disconnected');
		socket.close();
	});
	//console.log('got message: ' + msg);
};