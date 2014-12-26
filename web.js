var fs = require('fs');
var multiparty = require('multiparty');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var LocalStrategy = require('passport-local').Strategy;
var handlebars = require('express-handlebars');

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
passport.use('local', new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(username, password, done) {
	users.get(username).then(function(user) {
		if (user && user.get('password') == password) {
			return done(null, user.get('email'));
		} else {
			return done(null, false);
		}
	});
}));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	done(null, id);
});

var app = express();
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser());
app.use(session({
	secret: 's3cr3t',
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.engine('hbs', handlebars());
app.set('view engine', 'hbs');

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/register', function(req, res) {
	res.render('registration');
});

app.post('/register', function(req, res) {
	var email = req.body.email;
	var password = req.body.password;

	users.get(email).then(function(user) {
		if (user) {
			return res.render('registration', {emailNotAvailable: true})
		} else {
			try {
				users.add(email, password).then(function() {
					return res.redirect('/login');
				});
			} catch (err) {
				return res.status(500).send(err.message);
			}
		}
	});
});

app.get('/login', function(req, res) {
	res.render('login');
});

app.post('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
		if (err) {
			return next(err);
		}

		if (!user) {
			return res.render('login', {loginFailed: true});
		}

		req.logIn(user, function(err) {
			if (err) { return next(err); }
			return res.redirect('/web/contacts');
		});

	})(req, res, next);
});

app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

app.get('/web/contacts', function(req, res) {
	console.log(req.user);
	res.render('contacts',
		{
			email: req.user,
			path: contacts.getPath(req.user)
		});
});

app.post('/accounts', function(req, res) {
	if (req.get('Content-Type') != 'application/json') {
		return res.status(415).send('Unsupported Content-Type\n');
	}

	var email = req.body.email;
	var password = req.body.password;

	users.get(email).then(function(user) {
		if (user) {
			return res.status(400).json(new EmailExistsError());	
		} else {
			try {
				users.add(email, password).then(function() {
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


var port = Number(process.env.PORT || 5000);
app.listen(port);
console.log('Server started at ' + port);


// Errors

function EmailExistsError() {
	this.type = 'EmailExists';
	this.message = 'Specified e-mail address is already registered';
}

function InvalidCredentialsError() {
	this.type = 'InvlidEmailPassword';
	this.message = 'Specified e-mail / password combination is not valid.';
}
