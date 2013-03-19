// authentication
var authenticate = function(user, password){
	var users = [
		{user:'larry', password:'larry'},
		{user:'moody', password:'moody'}
	];
	for (var i = 0; i < users.length; i++) {
		_user = users[i];
		if(_user.user === user && _user.password === password)
			return _user;
	}
	return false;
};

// authorization
exports.checkAuth = function (req, res, next) {
  if (!req.session.user) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
};

// Login
exports.login = function(req, res){
	var post = req.body;
	var authedUser = authenticate(post.user, post.password);
	if (authedUser) {
		req.session.user = authedUser.user;
		sendResponse(res, "/chat");
	} else {
		sendResponse(res, "/bad");
	}
};

exports.logout = function(req, res){
	delete req.session.user;
	req.session = null;
	sendResponse(res, '/');
};

exports.chat = function(req, res){
  res.render('chat', { title: 'Welcome to Chat' });
};

exports.index = function (req, res) {
	if (req.session.user)
	{
		res.redirect('/chat');
		return;
	}
	res.render('index', { title: 'Welcome to VLAB' });
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