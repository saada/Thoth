/*
@================================================================================
@= WEBRTC STUFF
@================================================================================
*/
var localstream = null;
// Start Web socket connection
rtc.connect('ws://'+window.location.host.split(':')[0]+':4000', window.location.href.split('/').slice(-1)[0].split('#')[0]);
console.log('Connecting via WebRTC to ws://'+window.location.host.split(':')[0]+':4000 in room: '+window.location.href.split('/').slice(-1)[0].split('#')[0]);

$(function(){
	/*
	@================================================================================
	@= Capture frames from video into canvas (for VNC later)
	@================================================================================
	*/

// FIXME: currently not used
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
		var vid = div.hide().append('<video id="'+id+'" class="remotevideo '+id+'" autoplay controls></video>').children().first();

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
		$('.'+data.socketId).addClass('animated rotateOutDownLeft');

		setTimeout(function() {
			$('.'+data.socketId).parent().empty();
		  $('.video:empty').remove();
		}, 600);
		// $('#'+data.socketId).parent().fadeOut(1000,'swing',function() {
		// 	$(this).remove();
		// 	$('#'+data.socketId).fadeOut(1000,'swing',function() {
		// 		$(this).remove();
		// 	});
		// });

	});
});

// Get and attach local webcam stream
var getLocalCamera = function(){
	rtc.createStream({"video": true, "audio":true}, function(stream){
		localstream = stream;
		// Create video element
		var div = $('.videos').prepend('<div class="video row"></div>').children().first();
		var vid = div.hide().append('<video id="myvideo" autoplay controls muted="muted" src=""></video>').children().first();
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
			$('.centerStream').html($(this).clone().addClass('inheriter'));
	});
};

var count = 0;
// Takes parent div of video and video element and enables resizable, draggable
var animateVideo = function(div,vid) {
	setTimeout(function(){
		if(count < 60 && vid.prop('videoHeight')  === 0)
		{
			count++;
			animateVideo(div,vid);	//recursive call
			return;
		}
		else if(count >= 60)	//60*1000 = 60000ms = 30s
		{
			if(vid.is('#myvideo'))
				alert('Your webcam is taking too long to load...');
			else
				alert('Remote webcam failed to connect...');
			div.remove();
			vid.remove();
			return;
		}
		count = 0;

		var vidHeight = vid.prop('videoHeight'),
			vidWidth  = vid.prop('videoWidth'),
			initRatio = 1/4,
			minRatio  = 1/4,
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
		// div.show(600, 'easeInOutBack');
		div.show().addClass('animated bounceInLeft');
	}, 1000);
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

function scaleIframe(scale)
{
	$('#vncIframe').css({
		'width': 1024+1024/10,
		'height': 768+768/10,

		'zoom': 1.07/scale,

		'transform': 'scale('+scale+')',
		'transform-origin': '0 0'
	});
}

$(function() {
	// Show iframe when corresponding button is clicked
	var $centerStream = $('.centerStream');
	$('#resourceMap').click(function () {
		$centerStream.html('<iframe src="/canvas/vlab.html" class="span12" height="400" scrolling="no" frameborder="0"></iframe>');
	});
	$('.vm').click(function(){
		var vncPath = $(this).attr('vnc');
		var vncElement = '<div class="resize_iframe span12" id="iframe_wrapper"><iframe src="" id="vncIframe" style="" frameborder="0"></iframe></div>';
		$centerStream.html(vncElement);
		scaleIframe(parseInt($centerStream.css('width'))/1024);	//centerStream width
		$('.resize_iframe').hide();
		// Start the VNC connection
		$('.resize_iframe iframe').attr('src', function(idx, oldAttr){
			console.log(oldAttr);
			if(!oldAttr)
			{
				return "/vnc/vnc_auto.html?host="+window.location.host+"&port=80&password=123456&path="+vncPath;
			}
			else
			{
				return "";
			}
		});
		$centerStream.html($('#iframe_wrapper'));
		$('.resize_iframe').toggle();
		// $(this).toggleClass('btn-success');

		// Resize iframe
		setTimeout(function () {
			$('.resize_iframe').resizable({
				aspectRatio:true,
				side:{
					top:true,
					left:true,
					bottom:true,
					right:true
				},
				resize: function(event, ui) {
					scaleIframe(ui.size.width/1024);
				}
			});
		},1000);

		// Set iframe focus to enable keyboard input
		$('.resize_iframe').hover(function(){
			setTimeout(function() {
				$(".resize_iframe iframe")[0].contentWindow.focus();
			}, 100);
		});
	});
});

/*
@================================================================================
@= CHAT
@================================================================================
*/

function addToChat(msg, color) {
  var messages = document.getElementById('messages');
  msg = sanitize(msg);
  if(color) {
    msg = '<span style="color: ' + color + '; padding-left: 15px">' + msg + '</span>';
  } else {
    msg = '<strong style="padding-left: 15px">' + msg + '</strong>';
  }
  messages.innerHTML = messages.innerHTML + msg + '<br>';
  messages.scrollTop = 10000;
}

function sanitize(msg) {
  return msg.replace(/</g, '&lt;');
}
var websocketChat = {
  send: function(message) {
    rtc._socket.send(message);
  },
  recv: function(message) {
    return message;
  },
  event: 'receive_chat_msg'
};

var dataChannelChat = {
  send: function(message) {
    for(var connection in rtc.dataChannels) {
      var channel = rtc.dataChannels[connection];
      channel.send(message);
    }
  },
  recv: function(channel, message) {
    return JSON.parse(message).data;
  },
  event: 'data stream data'
};

function initChat() {
  var chat;

  if(rtc.dataChannelSupport) {
    console.log('initializing data channel chat');
    chat = dataChannelChat;
  } else {
    console.log('initializing websocket chat');
    chat = websocketChat;
  }

  var input = document.getElementById("chatinput");
  var toggleHideShow = document.getElementById("hideShowMessages");
  var room = window.location.hash.slice(1);
  var color = "#" + ((1 << 24) * Math.random() | 0).toString(16);

  toggleHideShow.addEventListener('click', function() {
    var element = document.getElementById("messages");

    if(element.style.display === "block") {
      element.style.display = "none";
    }
    else {
      element.style.display = "block";
    }

  });

  input.addEventListener('keydown', function(event) {
    var key = event.which || event.keyCode;
    if(key === 13) {
      chat.send(JSON.stringify({
        "eventName": "chat_msg",
        "data": {
          "messages": input.value,
          "room": room,
          "color": color
        }
      }));
      addToChat(input.value);
      input.value = "";
    }
  }, false);
  rtc.on(chat.event, function() {
    var data = chat.recv.apply(this, arguments);
    console.log(data.color);
    addToChat(data.messages, data.color.toString(16));
  });
}

$(function() {
	initChat();
});
