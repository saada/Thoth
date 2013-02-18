var socket = io.connect('http://localhost');
socket.on('all_rooms', function (data) {
	console.log(data);
	// socket.emit('my other event', { my: 'data' });
});

$(function(){
	
});