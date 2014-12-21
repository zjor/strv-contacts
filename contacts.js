var crypto = require('crypto');
var Firebase = require("firebase");

var fb = new Firebase("https://intense-heat-3248.firebaseio.com");

module.exports = function() {

	this.save = function(owner, contact, callback) {
		var hasher = crypto.createHash('sha1');
		fb.child(hasher.update(owner).digest('hex')).push(contact, callback);
	};

	this.fetchAll = function(owner, callback) {
		var hasher = crypto.createHash('sha1');
		fb.child(hasher.update(owner).digest('hex')).on('value', function(snapshot) {
			callback(snapshot.val());
		});
	}

	return this;
}