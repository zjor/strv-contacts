var crypto = require('crypto');
var Firebase = require("firebase");

var fb = new Firebase("https://intense-heat-3248.firebaseio.com");

module.exports = function() {

	this.save = function(owner, contact, callback) {
		fb.child(this.getPath(owner)).push(contact, callback);
	};

	this.fetchAll = function(owner, callback) {
		fb.child(this.getPath(owner)).on('value', function(snapshot) {
			callback(snapshot.val());
		});
	}

	this.getPath = function(email) {
		var hasher = crypto.createHash('sha1');
		return hasher.update(email).digest('hex');
	}

	return this;
}