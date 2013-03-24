// authentication
var authenticate = function(user, password){
	var users = [
		{username:'larry', password:'larry'},
		{username:'moody', password:'moody'}
	];
	for (var i = 0; i < users.length; i++) {
		_user = users[i];
		if(_user.username === user && _user.password === password)
			return _user;
	}
	return false;
};

// authorization
exports.checkAuth = function (req, res, next) {
  if (!req.session.username) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
};

// Login
exports.login = function(req, res){
	var post = req.body;
	var authedUser = authenticate(post.username, post.password);
	if (authedUser) {
		req.session.username = authedUser.username;
		sendResponse(res, "/chat");
	} else {
		sendResponse(res, "/bad");
	}
};

exports.logout = function(req, res){
	delete req.session.username;
	req.session = null;
	sendResponse(res, '/');
};

exports.chat = function(req, res){
  res.render('chat', { title: 'VLAB - Topics' });
};

exports.index = function (req, res) {
	if (req.session.username)
	{
		res.redirect('/chat');
		return;
	}
	res.render('index', { title: 'VLAB - Homepage' });
};

exports.bad = function (req, res){
	res.render('404', {title: '404', status: 404});
};

function sendResponse(res, data) {
	res.contentType('application/json');
	var _data = JSON.stringify(data);
	res.header('Content-Length', _data.length);
    res.end(_data);
}