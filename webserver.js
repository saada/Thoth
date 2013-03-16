var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var path    = require('path');
var routes = require('./routes');

// Config
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.cookieSession({cookie:{httpOnly: false}})); //allows client-side JS to access the session id
	app.use(express.session());
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.get('/chat', checkAuth, routes.chat);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.use(routes.bad);

// authorization
function checkAuth(req, res, next) {
  if (!req.session.user_id) {
    res.send('You are not authorized to view this page');
  } else {
    next();
  }
}

// exports
exports.express = express;
exports.app = app;
exports.server = server;