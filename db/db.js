var Sequelize = require("sequelize");

var sequelize = new Sequelize('database', 'user', 'password', {
  // the sql dialect of the database
  dialect: 'sqlite',

  // the storage engine for sqlite
  // - default ':memory:'
  storage: 'db.sqlite'
  // Of course all other options can be specified as well
});

// Define models
var User = sequelize.import(__dirname + "\\Models\\User");

// Create the tables:
User.sync();	// pass the {force:true} to drop and re-create