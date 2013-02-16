// Root
exports.index = function(req, res){
  res.render('index', { title: 'Welcome to VLAB' });
};

exports.chat = function(req, res){
  res.render('chat', { title: 'Welcome to Chat' });
};