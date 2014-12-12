var express = require('express');
var mysql = require('mysql');
var formidable = require('formidable');

var app = express();
var router = express.Router();
var connection = require('./connection.js');

connection.connect(function(err){
	if (err) {
    console.error('Error connecting to database: ' + err.stack);
  } else {
	  console.log('Connected to database');
	}
});

// Set relative root path
app.use('/', router);

// For all routes
router.use(function(req, res, next) {
	// testing only, remove for prod
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  console.log('Received '+req.method+' request for '+req.url+' at '+new Date().toUTCString());
	next(); // Continue to specific route
});

router.route('/').get(function(req, res) {
	connection.query('select * from tracking order by id desc', function(err, rows) {
		if (err) { throw err; }
		res.json(rows);
	});
});

router.route('/').post(function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields) {
		if (err) { throw err; }
		// passes in JS object as params (will be escaped by node.js mysql module)
		// note: mysql now() is used because a JS Date() object will use server time
		// this server is on phoenix time, and mysql SHOULD be set to use US/Eastern
		connection.query('insert into tracking set ?, timestamp = now()', fields, function(err) { if (err) { throw err; } });
		// and return the current rows
		connection.query('select * from tracking order by id desc', function(err, rows) {
		if (err) { throw err; }
		res.json(rows);
	});

	});
});

var server = app.listen(8080, function() {
	console.log('Listening on %s:%s', server.address().address, server.address().port);
});
