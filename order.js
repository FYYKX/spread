var request = require('request');
var cron = require('node-cron');
var async = require('async');

var BigNumber = require('bignumber.js');

var client = require('./quoine');


var config = process.argv.slice(2);
if (config.length) {
    config = require('./' + config);

    var quoine = new client(config);

    var interval = new BigNumber(config.interval);
    if (config.side == "sell") {
        interval = interval.multipliedBy(-1);
    }

    var price = new BigNumber(config.price);

    var quotient = Math.floor(config.amount / config.unit);
    var remainder = config.amount % config.unit;
    var orders = [];
    for (let index = 0; index < quotient; index++) {
        orders.push(price.toFormat(8));
        price = price.plus(interval);
    }

    async.everySeries(orders, function (price, callback) {
        quoine.neworder(config.product_id, config.unit, price, config.side, function (response) {
            if (response.errors) {
                console.log(response.errors);
            } else {
                console.log(config.side + " " + price + " " + config.unit + " " + response.currency_pair_code);
            }
            callback(null);
        });
    }, function (err, result) {
    });
} else {
    console.log('Can not find config file');
}