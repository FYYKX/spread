var request = require('request');
var jwt = require('jsonwebtoken');

var self;

var quoine = function (config) {
	self = this;

	this.token_id = config.token_id;
	this.user_secret = config.user_secret;
	this.baseRequest = request.defaults({
		headers: {
			'Content-Type': 'application/json',
			'X-Quoine-API-Version': '2'
		},
		baseUrl: config.base_url
	});
}

function getOptions(verb, url, payload) {
	var signature = jwt.sign(payload, self.user_secret);
	var body = '';

	if (verb == 'PUT' || verb == 'POST') {
		body = JSON.stringify(payload);
	}

	return {
		url: url,
		headers: {
			'X-Quoine-Auth': signature
		},
		body: body
	};
}

quoine.prototype.balances = function (callback) {
	var verb = 'GET';
	var url = '/accounts/balance';
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.get(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.trades = function (product_id, callback) {
	var verb = 'GET';
	var url = '/executions/me?product_id=' + product_id;
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.get(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.order = function (id, callback) {
	var verb = 'GET';
	var url = '/orders/' + id;
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.get(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.liveorders = function (product_id, callback) {
	var verb = 'GET';
	var url = '/orders?&status=live&product_id=' + product_id;
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.get(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.neworder = function (product_id, amount, price, side, callback) {
	var verb = 'PUT';
	var url = '/orders/';
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id,
		'order': {
			'order_type': 'limit',
			'product_id': product_id,
			'side': side,
			'quantity': amount,
			'price': price
		}
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.post(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.cancelorder = function (id, callback) {
	var verb = 'GET';
	var url = '/orders/' + id + '/cancel';
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.put(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

quoine.prototype.editorder = function (id, price, quantity, callback) {
	var verb = 'PUT';
	var url = '/orders/' + id;
	var payload = {
		'path': url,
		'nonce': Date.now(),
		'token_id': this.token_id,
		'order': {
			'quantity': quantity,
			'price': price
		}
	};

	var options = getOptions(verb, url, payload);

	this.baseRequest.put(options, function (error, response, body) {
		callback(JSON.parse(body));
	});
};

module.exports = quoine;