var request = require('request');
var crypto = require('crypto');

var self;

var fatbtc = function () {
    self = this;

    this.api_key = '';
    this.api_secret = '';
    this.sign_type = 'MD5';
    this.baseRequest = request.defaults({
        headers: {
            'Content-Type': 'application/json'
        },
        baseUrl: 'https://www.fatbtc.us'
    });
}

function getSign(payload) {
    payload.apiSecret = self.api_secret;
    var query = Object.keys(payload)
        .reduce(function (a, k) {
            a.push(k + '=' + encodeURIComponent(payload[k]));
            return a
        }, [])
        .join('&');
    signature = crypto.createHash('md5').update(query).digest('hex');
    delete payload.apiSecret
    return signature.substr(0, 28)
}

fatbtc.prototype.depth = function (symbol, callback) {
    this.baseRequest.get({
        url: "/m/depth/" + symbol
    }, function (error, response, body) {
        callback(JSON.parse(body));
    })
}

fatbtc.prototype.getSingleCurrency = function (callback) {
    var timestamp = parseInt(Date.now() / 1000)
    var payload = {
        api_key: api_key,
        sign_type: "MD5",
        timestamp: timestamp
    }
    var sign = getSign(payload);
    var url = '/m/api/a/account/1/BTC/' + api_key + "/" + timestamp + "/MD5/" + sign;
    baseRequest.get({
        url: url
    }, function (error, response, body) {
        callback(JSON.parse(body));
    });
};

fatbtc.prototype.createOrder = function (symbol, volume, price, side, callback) {
    var timestamp = Date.now()
    var payload = {
        api_key: this.api_key,
        o_no: timestamp.toString(),
        o_price_type: "limit",
        o_type: side,
        price: price.toString(),
        sign_type: this.sign_type,
        site_id: 1,
        symbol: symbol,
        timestamp: parseInt(timestamp / 1000),
        volume: volume,
    }
    payload.sign = getSign(payload);
    var url = '/order/api/order'
    this.baseRequest.post({
        url: url,
        body: JSON.stringify(payload)
    }, function (error, response, body) {
        callback(JSON.parse(body));
    });
};

fatbtc.prototype.cancelOrder = function (id, symbol, callback) {
    var timestamp = parseInt(Date.now() / 1000)
    var payload = {
        site_id: 1,
        api_key: this.api_key,
        id: id,
        o_no: Date.now(),
        symbol: symbol,
        timestamp: timestamp,
        sign_type: this.sign_type,
    }
    payload.sign = getSign(payload);

    var url = '/order/api/order'
    baseRequest.post({
        url: url,
        body: JSON.stringify(payload)
    }, function (error, response, body) {
        callback(JSON.parse(body));
    });
};

fatbtc.prototype.getOrderList = function (id, symbol, callback) {
    var timestamp = parseInt(Date.now() / 1000)
    var payload = {
        site_id: 1,
        api_key: this.api_key,
        id: id,
        o_no: Date.now(),
        symbol: symbol,
        timestamp: timestamp,
        sign_type: this.sign_type,
    }
    payload.sign = getSign(payload);

    var url = '/order/api/order'
    baseRequest.post({
        url: url,
        body: JSON.stringify(payload)
    }, function (error, response, body) {
        callback(JSON.parse(body));
    });
};

module.exports = fatbtc;