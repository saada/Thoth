var Sequelize = require("sequelize");

var sequelize = new Sequelize('database', 'user', 'password', {
  // the sql dialect of the database
  dialect: 'sqlite',

  // the storage engine for sqlite
  // - default ':memory:'
  storage: './db/db.sqlite'
  // Of course all other options can be specified as well
});

// Define models
var User = sequelize.import(__dirname + "\\Models\\User");
var Email = sequelize.import(__dirname + "\\Models\\Email");

// Define relations
User.hasMany(Email);
Email.belongsTo(User);

var chain = new Sequelize.Utils.QueryChainer();
chain
// Create the tables:
	.add(sequelize.sync({force:true}))	// pass the {force:true} to drop and re-create all tables
// Create users
	.add(User.create({ username: 'moody', password: 'moody' }))
	.add(User.create({ username: 'larry', password: 'larry' }))
	.add(User.create({ username: 'terry', password: 'terry' }))
	.add(User.create({ username: 'drhuang', password: 'drhuang' }));

// Add emails
chain.run().success(function(results){
	console.log("DB: Tables created...");
	var moody = results[1];
	console.log(moody.values);
	Email.create({email:'msaada@asu.edu'}).success(function(email){
		moody.addEmail(email).success(function(){
			moody.getEmails().success(function(savedEmails){
				console.log(savedEmails);
				// Email.findAll().success(function(emails){
				// 	console.log(emails);
				// });
			});
		});
	});
});
// Find emails