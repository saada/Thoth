// Root
exports.login = function(req, res){
	var post = req.body;
	if (post.user === '' && post.password === '') {
		req.session.user_id = "123";
		sendResponse(res, "/chat");
	} else {
		sendResponse(res, "/bad");
	}
};

exports.logout = function(req, res){
	delete req.session.user_id;
	sendResponse(res, '/');
};

exports.chat = function(req, res){
  res.render('chat', { title: 'Welcome to Chat' });
};

exports.index = function (req, res) {
	res.render('index', { title: 'Welcome to VLAB' });
};

exports.bad = function (req, res){
	res.render('404', {title: '404'});
};

function sendResponse(res, data) {
	res.contentType('application/json');
	var _data = JSON.stringify(data);
	res.header('Content-Length', _data.length);
    res.end(_data);
}