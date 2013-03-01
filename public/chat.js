/*
@================================================================================
@= WEBRTC STUFF
@================================================================================
*/
var _rtc = jQuery.extend(true, {}, rtc);
var localstream = null;

$(function(){
	/*
	@================================================================================
	@= Capture frames from video into canvas (for VNC later)
	@================================================================================
	*/

	$('video').click(function(e) {
		id = $(e.target).attr('id');
		setCenterCanvas(id);
	});

	function setCenterCanvas(id)
	{
		console.log("the id is: "+id);
		var canvas = document.getElementById('canvas');
		var ctx    = canvas.getContext('2d');
		var video  = document.getElementById(id);

		video.addEventListener('play', function () {
			canvas.width = video.clientWidth;
			canvas.height = video.clientHeight;
			var _this = this; //cache
			(function loop() {
				if (!_this.paused && !_this.ended) {
					ctx.drawImage(_this, 0, 0);
					// This converts the image to base64 data. Unfortunately 
					// it slows down performance drastically.
					// canvas.toDataURL("image/png");
					setTimeout(loop, 1000 / 60); // drawing at 30fps
				}
			})();
		}, 0);
	}

	$('#logoutBtn').click(function(e) {
		$.get('/logout', function(data, textStatus, xhr) {
			window.location.href = data;
		});
	});

	// Video Conferencing code
	$('.room').click(function(e){
		$('.remotevideo').remove();
		$('#roominfo').html('You are in room '+$(e.target).html());
		// Close socket if not null
		if(rtc !==null && rtc._socket !== null){
			closeRTC();
		}
		// Clone new instance of rtc
		rtc = jQuery.extend(true, {}, _rtc);
		rtc.connect('ws://'+window.location.host.split(':')[0]+':4000', $(e.target).html());
		console.log('Connecting via WebRTC to ws://'+window.location.host.split(':')[0]+':4000 in room: '+$(e.target).html());
		
		if(localstream === null)
		{
			getLocalCamera();
		}

		rtc.on('ready',function(){
			console.log("READY EVENT");
		});
		//on add remote stream
		rtc.on('add remote stream',function(stream, id){
			console.log('add remote stream');
			var div = $('.videos').prepend('<div class="video"></div>').children().first();
			div.append('<video id='+id+' class="remotevideo" autoplay></video>');
			rtc.attachStream(stream, id);
			console.log('new remote stream id is: ' + id);
			setTimeout(function() {
				$('.video').css('max-height', $('#'+id).prop('videoHeight'));
				$('.video').css('min-height', $('#'+id).prop('videoHeight')/3);
				$('.video').css('max-width', $('#'+id).prop('videoWidth'));
				$('.video').css('min-width', $('#'+id).prop('videoWidth')/3);
				$('#'+id).css('max-height', $('#'+id).prop('videoHeight'));
				$('#'+id).css('min-height', $('#'+id).prop('videoHeight')/3);
				$('#'+id).css('max-width', $('#'+id).prop('videoWidth'));
				$('#'+id).css('min-width', $('#'+id).prop('videoWidth')/3);
				$(".video").draggable().resizable({aspectRatio:true});
				$('#'+id).show();
			}, 1000)
		});
		// close_stream
		rtc.on('close_stream',function(data){
			console.log('close stream');
			console.log(data);
		});
		rtc.on('remove_peer_connected', function(data) {
			console.log('peer disconnected! socketId:'+data.socketId);
			// remove video element
			$('#'+data.socketId).parent().remove();
		});

		
	});
});

var getLocalCamera = function(){
	rtc.createStream({"video": true, "audio":true}, function(stream){
		localstream = stream;
		// Create video element
		var div = $('.videos').prepend('<div class="video"></div>').children().first();
		var vid = div.append('<video id="myvideo" autoplay src=""></video>');

		// Attach stream
		rtc.attachStream(localstream, 'myvideo');
		// While no src defined, wait
		// while(! $('#myvideo').prop('videoHeight') > 0)
		// {
		// }
		setTimeout(function() {
		$('.video').css('max-height', $('#myvideo').prop('videoHeight'));
		$('.video').css('min-height', $('#myvideo').prop('videoHeight')/3);
		$('.video').css('max-width', $('#myvideo').prop('videoWidth'));
		$('.video').css('min-width', $('#myvideo').prop('videoWidth')/3);
		$('video').css('max-height', $('#myvideo').prop('videoHeight'));
		$('video').css('min-height', $('#myvideo').prop('videoHeight')/3);
		$('video').css('max-width', $('#myvideo').prop('videoWidth'));
		$('video').css('min-width', $('#myvideo').prop('videoWidth')/3);
		$(".video").draggable().resizable({aspectRatio:true});
		$('#myvideo').show();
		}, 1000)


	});
};

var closeRTC = function(){
	console.log("closing socket...");
	rtc._socket.close();
};