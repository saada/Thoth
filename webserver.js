/*
@================================================================================
@= WEBSERVER
@================================================================================
*/

var express     = require('express');
var http        = require('http');
var path        = require('path');
var routes      = require('./routes');
var MemoryStore = express.session.MemoryStore;
var sessionStore;

var configureExpress = function(app){
	app.configure(function(){
		app.set('views', __dirname + '/views');
		app.set('view engine', 'jade');
		app.use(express.favicon());
		app.use(express.compress());
		app.use(express.staticCache());
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
	app.get('/login', routes.login);
	app.get('/topics', routes.checkAuth, routes.topics);
	app.get('/topics/:topic', routes.checkAuth, routes.topic);
	app.get('/mobicloud', routes.checkAuth, routes.mobicloud);
	app.post('/login', routes.loginPost);
	app.get('/logout', routes.logout);
	app.use(routes.bad);
};

var Class = function(port){
	app    = express();
	sessionStore = new MemoryStore();

	// Config
	configureExpress(app);

	// Start Server
	server = http.createServer(app);
	server.listen(port, function(){
		console.log('HTTP server running on port %d...',port);

		if (process.argv[2] == '-o')  //launch browser
			require('open')('http://localhost:' + port);
		else
			console.log("~# You could pass '-o' to open localhost on a browser #~");
	});

	this.app = app;
	this.server = server;
	this.sessionStore = sessionStore;
};

// exports
module.exports = Class;