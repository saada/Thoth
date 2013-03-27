/*
@================================================================================
@= WEBSERVER
@================================================================================
*/

var express = require('express');
var app     = express();
var server  = require('http').createServer(app);
var path    = require('path');
var routes = require('./routes');
var sessionStore = new express.session.MemoryStore();

// Config
app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.favicon());
	// app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('monkey'));
	app.use(express.cookieSession());
	app.use(express.session({store:sessionStore}));
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

// routes
app.get('/', routes.index);
app.get('/topics', routes.checkAuth, routes.topics);
app.get('/topics/:topic', routes.checkAuth, routes.topic);
app.get('/mobicloud', routes.checkAuth, routes.mobicloud);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.use(routes.bad);

// exports
exports.express = express;
exports.app = app;
exports.server = server;
exports.sessionStore = sessionStore;

exports.listen = function(port){
	server.listen(port, function(){
		if (process.argv[2] == '-o')  //launch browser
			require('open')('http://localhost:' + port);
		else
			console.log("~# You could pass '-o' to open localhost on a browser #~");
	});
};