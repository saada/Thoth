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

	$('video,canvas').click(function(e) {
		// id = $(e.target).attr('id');
		// setCenterCanvas(id);
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

	// Video Conferencing code
	$('.remotevideo').parent().fadeOut(1000,'swing',function() { $(this).remove(); });
	// Close socket if not null
	if(rtc !==null && rtc._socket !== null){
		closeRTC();
	}
	// Clone new instance of rtc
	rtc = jQuery.extend(true, {}, _rtc);
	rtc.connect('ws://'+window.location.host.split(':')[0]+':80', $('.brand').html());
	console.log('Connecting via WebRTC to ws://'+window.location.host.split(':')[0]+':80 in room: '+$('.brand').html());

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
		var div = $('.videos').prepend('<div class="video row"></div>').children().first();
		var vid = div.hide().append('<video id='+id+' class="remotevideo" autoplay controls></video>').children().first();

		centralizeStreamOnClick(vid);

		rtc.attachStream(stream, id);
		console.log('new remote stream id is: ' + id);

		animateVideo(div,vid);
	});

	// close_stream
	rtc.on('close_stream',function(data){
		console.log('close stream');
		console.log(data);
	});
	rtc.on('remove_peer_connected', function(data) {
		console.log('peer disconnected! socketId:'+data.socketId);
		// remove video element
		$('#'+data.socketId).parent().fadeOut(1000,'swing',function() {
			$(this).remove();
			$('#'+data.socketId).fadeOut(1000,'swing',function() {
				$(this).remove();
			});
		});

	});
});

// Get and attach local webcam stream
var getLocalCamera = function(){
	rtc.createStream({"video": true, "audio":true}, function(stream){
		localstream = stream;
		// Create video element
		var div = $('.videos').prepend('<div class="video row"></div>').children().first();
		var vid = div.hide().append('<video id="myvideo" autoplay controls src=""></video>').children().first();
		centralizeStreamOnClick(vid);
		// Attach stream
		rtc.attachStream(localstream, 'myvideo');

		animateVideo(div,vid);
	});
};

// Clone element and place it in the center of the screen on click
var centralizeStreamOnClick = function(element){
	element.click(function(){
		var inner = $('.centerStream').children().first();
		if(! (inner.is('#'+$(this).attr('id'))))
		{
			$('.centerStream').html(
				$(this).clone().css({
					'max-height':'inherit',
					'min-height':'inherit',
					'max-width' :'inherit',
					'min-width' :'inherit'
				})
			);
		}
	});
};

var count = 0;
// Takes parent div of video and video element and enables resizable, draggable
var animateVideo = function(div,vid) {
	setTimeout(function(){
		if(count < 500 && vid.prop('videoHeight')  === 0)
		{
			count++;
			animateVideo(div,vid);	//recursive call
			return;
		}
		else if(count >= 500)	//500*20 = 10000ms = 10s
		{
			div.remove();
			vid.remove();
			alert('Your webcam is taking too long to load');
			return;
		}
		count = 0;

		var vidHeight = vid.prop('videoHeight'),
			vidWidth  = vid.prop('videoWidth'),
			initRatio = 1/3,
			minRatio  = 1/3,
			maxRatio  = 1;

		var min_max_size = {
			// MIN
			'min-height': vidHeight * minRatio,
			'min-width' : vidWidth  * minRatio,
			// MAX
			'max-height': vidHeight * maxRatio,
			'max-width' : vidWidth  * maxRatio
		};

		var init_size = {
			// INIT
			'height'	: vidHeight	* initRatio,
			'width'		: vidWidth	* initRatio
		};

		vid.css(min_max_size);
		div.css(min_max_size).css(init_size);
		// div.draggable().resizable({aspectRatio:true});
		div.resizable({aspectRatio:true,side:{top:true,left:true,bottom:true,right:true}});
		$('.videos').sortable({
			// containment: '.videos',
			revert: 200,
			cursor: 'move',
			tolerance: 'pointer',
			scroll: false,
			connectWith: '.videos',
			items: "> .video",
			stop: function( event, ui ) {
				//video pauses after drag... this fixes the bug
				ui.item.children().first()[0].play();
			}
		});
		div.show(600, 'easeInOutBack');
	}, 20);
};

var closeRTC = function(){
	console.log("closing socket...");
	rtc._socket.close();
};

/*
@================================================================================
@= IFRAME
@================================================================================
*/
$(function() {
	// $('.resize_iframe').resizable({
	// 	aspectRatio:true,
	// 	side:{
	// 		top:true,
	// 		left:true,
	// 		bottom:true,
	// 		right:true
	// 	},
	// 	resize: function(event, ui) {
	// 		$(".resize_iframe iframe").css({ "height": ui.size.height,"width":ui.size.width});
	// 	}
	// });
	// $('.resize_iframe').click(function(){
	// 	setTimeout(function() {
	// 		$(".resize_iframe iframe")[0].contentWindow.focus();
	// 	}, 100);
	// });
});