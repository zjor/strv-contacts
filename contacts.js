var crypto = require('crypto');
var Firebase = require("firebase");

var fb = new Firebase("https://intense-heat-3248.firebaseio.com");

// var FirebaseTokenGenerator = require("firebase-token-generator");
// var firebaseSecret = "spGa0n2MBvLzNF2UDiqotVBSJmWAnA4df4n3rUCc";
// var tokenGenerator = new FirebaseTokenGenerator(firebaseSecret);
// var token = tokenGenerator.createToken({uid: "zjor.se@gmail.com", password: "s3cr3t"});

// console.log(token);
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


// curl -X PUT -d '{
//   "firstName": "Sergey",
//   "lastName": "Royz",
//   "phone": "+79265827572"
// }' "https://intense-heat-3248.firebaseio.com/$user_id/contacts.json?auth=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InVpZCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifSwiaWF0IjoxNDE5MTc0OTA1fQ.UHig-g6mcYONmhxiXc91OB4t_QgxCobtW5yDrqRO0aM"