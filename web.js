var fs = require('fs');
var multiparty = require('multiparty');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var jwt = require('jwt-simple');

var users = require('./users.js')();
var contacts = require('./contacts.js')();
var images = require('./images.js')();

var jwtSecret = 'dbc2EgDM';

passport.use('bearer', new BearerStrategy(function(token, done) {
	var user = jwt.decode(token, jwtSecret);
	if (!user) {
		return done(null, false);
	} else {
		return done(null, user.email);
	}
}));

var app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(passport.initialize());


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

app.post('/contacts', passport.authenticate('bearer', {session: false}), function(req, res) {
	if (req.get('Content-Type') != 'application/json') {
		return res.status(415).send('Unsupported Content-Type\n');
	}

	// TODO: save only (firstName, lastName, phone) and use optional contactId for update
	contacts.save(req.user, req.body, function(err) {
		if (err) {
			return res.status(500).end(err.message);
		} else {
			return res.status(201).end();
		}
	});
	
});

app.get('/contacts', passport.authenticate('bearer', {session: false}), function(req, res) {

	contacts.fetchAll(req.user, function(data) {
		console.log(data);
		res.json(data);
	});	
});

app.post('/photos', passport.authenticate('bearer', {session: false}), function(req, res) {
	var contactId = req.query.contactId;
	var form = new multiparty.Form();
	form.on('part', function(part) {
		images.upload(contactId, part, part.byteCount, function(err) {
			if (err) {
				return res.status(500).end('Uploading failed');
			} else {
				return res.status(201).end();		
			}
		});
		
	});
	form.parse(req);
});

app.listen(7001);
console.log('Server started at: 7001');


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

Create contact:
	curl -X POST -H "Content-Type: application/json" "http://127.0.0.1:7001/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -d '{"firstName": "Dan", "lastName": "Millman", "phone": "1-800-200-654"}' -v
	curl "http://127.0.0.1:7001/contacts?access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v

Upload photo:
	curl -F "file=@face.jpg" "http://127.0.0.1:7001/photos?contactId=123&access_token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6Inpqb3Iuc2VAZ21haWwuY29tIiwicGFzc3dvcmQiOiJzM2NyM3QifQ.utAyPF5u95d3ONM-ezN_ZsU5_szHAXwobVvsnW6-pJk" -v


*/