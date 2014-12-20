var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var jwt = require('jwt-simple');
var jwtSecret = 'dbc2EgDM';

var users = require('./users.js')();

var app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.post('/accounts', function(req, res) {
	if (req.get('Content-Type') != 'application/json') {
		return res.status(415).send('Unsupported Content-Type\n');
	}

	var email = req.body.email;
	var password = req.body.password;
	//TODO: validate email here

	users.get(email).then(function(user) {
		if (user) {
			return res.status(400).json(new EmailExistsError());	
		} else {
			try {
				users.add(req.body.email, req.body.password).then(function() {
					res.status(201).end();
				});
			} catch (err) {
				return res.status(500).send(err.message);
			}			
		}
	});
});

app.get('/access_token', function(req, res) {
	
	var credentials = {
		email: req.query.email, 
		password: req.query.password
	};

	users.get(credentials.email).then(function(user) {
		if (user && user.get('password') == credentials.password) {
			var token = jwt.encode(credentials, jwtSecret);
			// setting cookie to allow secured call from browser
			res.cookie('auth_token', token);
			return res.json({access_token: token});
		} else {
			return res.status(401).json(new InvalidCredentialsError());
		}
	});

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