var _rtc = jQuery.extend(true, {}, rtc);
var localstream = null;

$(function(){
	$('#myvideo').hide();
	$('.room').click(function(e){
		$('.remotevideo').remove();
		$('#roominfo').html('You are in room '+$(e.target).html());
		// Close socket if not null
		if(rtc !==null && rtc._socket !== null){
			closeRTC();
		}
		// Clone new instance of rtc
		rtc = jQuery.extend(true, {}, _rtc);
		rtc.connect('ws://localhost:4000', $(e.target).html());
		
		if(localstream === null)
		{
			getLocalCamera();
		}

		rtc.on('ready',function(){
			console.log("READY");

			// Listen for socket closes
			rtc._socket.onclose = function(event) {
				console.log('Client notified socket has closed',event);
				// $('#myvideo').attr('src','');
			};
		});
		//on add remote stream
		rtc.on('add remote stream',function(stream, id){
			console.log('add remote stream');
			$('.videos').append('<video id='+id+' class="remotevideo" autoplay></video>');
			rtc.attachStream(stream, id);
		});
		// close_stream
		rtc.on('close_stream',function(data){
			console.log('close stream');
			console.log(data);
		});
		rtc.on('remove_peer_connected', function(data) {
			console.log('peer disconnected! socketId:'+data.socketId);
			// remove video element
			$('#'+data.socketId).remove();
		});

		
	});
});

var getLocalCamera = function(){
	rtc.createStream({"video": true, "audio":true}, function(stream){
		localstream = stream;
		rtc.attachStream(localstream, 'myvideo');
		$('#myvideo').show();
	});
};

var closeRTC = function(){
	console.log("closing socket...");
	rtc._socket.close();
};