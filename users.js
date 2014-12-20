var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : '127.0.0.1',
    user     : 'test',
    password : 'testpassword',
    database : 'strv-contacts',
    charset  : 'utf8'
  }
});

var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
  tableName: 'users',
  idAttribute: 'email'
});

module.exports = function(){

	this.add = function(email, password) {
		return User.forge({email: email, password: password}).save(null, {method: 'insert'});
	};

	this.get = function(email) {
		return User.forge({email: email}).fetch();
	}

	return this;
};