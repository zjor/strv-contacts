var knex = require('knex')({
  client: 'pg',
  connection: {
    host     : 'ec2-54-204-42-119.compute-1.amazonaws.com',
    user     : 'kbiqnvwhgkydyh',
    password : 'fb4HDwjJFidvfWKIplwc7AAZ71',
    database : 'd6uqv6ldcqbkvu',
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