//
// Constants
//=============

/**
 * The extension id of Invigilator
 * @type {string}
 */
var EXTENSION_ID = 'dlpjjapnhlekpenbampkmdhekejancen';

var DEBUG = true;

if (DEBUG) {
	console.log('DEBUG mode');
	var MEMCACHED_EXPIRY = 30 * 60; // 30 minutes
}
else {
	var MEMCACHED_EXPIRY = 60 * 60 * 24; // 1 day
}

//
// Set up app
//==============

var express = require('express');
var request = require('request');
var Memcached = require('memcached');

var app = express();
app.use(express.urlencoded());

var memcached = new Memcached('127.0.0.1:11211', {
	debug: DEBUG
});

//
// Helper functions
//=====================

var log = function() {
	if (DEBUG) {
		console.log.apply(console, Array.prototype.slice.call(arguments));
	}
}

var memcachedKey = function(id) {
	return 'invigilator.' + id;
};

var sendResponse = function(res, statusCode, output) {

	// output json content type
	res.writeHead(statusCode, {
		'content-type': 'application/json'
	});

	res.write(JSON.stringify(output));
	res.end();

};

/*
 * Routes
 ==============*/

/*
 * Fetch data for an extension
 * /[extensionId]
 */
app.get(/^\/([a-z]{32})$/, function(req, res) {

	// get extension id from request
	var extensionId = req.params[0];

	// check whether the memcached entry has expired
	// no point setting it until it has expired
	memcached.get(memcachedKey(extensionId), function(err, data) {

		// key found
		if (!!data) {

			try {
				data = JSON.parse(data)
				data.success = true;
			}
			catch (e) {
				sendResponse(res, 400, {
					success: false,
					msg: 'Invalid cached data'
				});
				return;
			}

			sendResponse(res, 200, data);
			return;
		}
		else {

			sendResponse(res, 200, {
				success: false,
				msg: 'Cached data not found'
			});
			return;

		}

	});

});

/**
 * Save cache data
 * /cache/[extensionId]
 */
app.post(/^\/([a-z]{32})$/, function(req, res) {

	// get extension id from request
	var extensionId = req.params[0];

	// get post body
	var body = req.body;

	// check both owner and reviews has been set
	if (!body.hasOwnProperty('owner') || !body.hasOwnProperty('reviews')) {
		sendResponse(res, 400, {
			success: false,
			msg: 'Not all parameters present'
		});
		return;
	}

	// get owner and reviews
	var owner = req.body.owner;
	var reviews = req.body.reviews;

	// reviews must be a positive int
	if (!/^\d+$/.test(reviews)) {
		sendResponse(res, 400, {
			success: false,
			msg: 'Invalid parameter value'
		});
		return;
	}

	// cast reviews as int
	reviews = parseInt(reviews, 10);

	// check whether the memcached entry has expired
	// no point setting it until it has expired
	memcached.get(memcachedKey(extensionId), function(err, data) {

		// entry found
		if (!!data) {

			sendResponse(res, 400, {
				success: false,
				msg: 'Cached data not expired'
			});
			return;

		}
		// entry not found so save it
		else {

			var data = JSON.stringify({
				'owner': owner,
				'reviews': reviews
			});

			memcached.set(memcachedKey(extensionId), data, MEMCACHED_EXPIRY, function(err) {

				sendResponse(res, 200, {
					success:true
				});
				return;

			});

		}

	});

});

/*
 * Listen
 ==============*/

var server = app.listen(3000, function() {
	console.log('Server started listening on port %d', server.address().port);
});