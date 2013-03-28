var Sequelize = require("sequelize");
var db, User, Email;

exports.db = function(){

	if (!db){
		db = new Sequelize('database', 'user', 'password', {
			logging:false,
			dialect: 'sqlite',
			storage: './db/db.sqlite'
		});

		// Define models
		User = db.import(__dirname + "\\Models\\User");
		Email = db.import(__dirname + "\\Models\\Email");
		setupDB();
	}

	// Return everything
	return {
		db:db,
		User:User,
		Email:Email
	};
};

function setupDB(){
	// Define relations
	User.hasMany(Email);
	Email.belongsTo(User);

	var chain = new Sequelize.Utils.QueryChainer();
	chain
	// Create the tables:
		.add(db.sync({force:true}))	// pass the {force:true} to drop and re-create all tables
	// Create users
		.add(User.create({ username: 'moody', password: 'moody' }))
		.add(User.create({ username: 'larry', password: 'larry' }))
		.add(User.create({ username: 'terry', password: 'terry' }))
		.add(User.create({ username: 'drhuang', password: 'drhuang' }));

	// Add emails
	chain.run().success(function(results){
		console.log("DB: Tables created...");
		var moody = results[1];
		// console.log(moody.values);
		Email.create({email:'msaada@asu.edu'}).success(function(email){
			moody.addEmail(email).success(function(){
				moody.getEmails().success(function(savedEmails){
					// console.log(savedEmails);
					// Email.findAll().success(function(emails){
					// 	console.log(emails);
					// });
				});
			});
		});
	});
	// Find emails
}