var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var jwt = require('jwt-simple');
var jwtSecret = 'dbc2EgDM';

var app = express();

app.use(bodyParser.json());
app.use(cookieParser());

var users = (function(){
	var storage = {};

	this.exists = function(email) {
		return (email in storage);
	};

	this.add = function(email, password) {
		storage[email] = password;
	};

	this.authorize = function(email, password) {
		return exists(email) && storage[email] == password;
	}

	return this;

})();


app.post('/accounts', function(req, res) {
	if (req.get('Content-Type') != 'application/json') {
		return res.status(415).send('Unsupported Content-Type\n');
	}

	var email = req.body.email;
	var password = req.body.password;
	//TODO: validate email here

	if (users.exists(email)) {
		return res.status(400).json(new EmailExistsError());
	}

	try {
		users.add(req.body.email, req.body.password);
	} catch (err) {
		return res.status(500).send(err.message);
	}
	res.status(201).end();
});

app.get('/access_token', function(req, res) {
	
	var credentials = {
		email: req.query.email, 
		password: req.query.password
	};

	if (users.authorize(credentials.email, credentials.password)) {
		var token = jwt.encode(credentials, jwtSecret);
		res.cookie('auth_token', token);
		return res.json({access_token: token});
	} else {
		return res.status(401).json(new InvalidCredentialsError());
	}
});

app.listen(7001);


// Errors

function EmailExistsError() {
	this.type = 'EmailExists';
	this.message = 'Specified e-mail address is already registered';
}

function InvalidCredentialsError() {
	this.type = 'InvlidEmailPassword';
	this.message = 'Specified e-mail / password combination is not valid.';
}

/**
Registration:
	curl -X POST -H "Content-Type: application/json" http://127.0.0.1:7001/accounts -d "{\"email\":\"zjor.se@gmail.com\", \"password\": \"s3cr3t\"}" -v

Authentication:
curl "http://127.0.0.1:7001/access_token?email=zjor.se@gmail.com&password=s3cr3t" -v

*/