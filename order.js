var request = require('request');
var cron = require('node-cron');
var async = require('async');

var client = require('./quoine');

var config = process.argv.slice(2);
if (config.length) {
    config = require('./' + config);

    var quoine = new client(config);

    var interval = 0.00000001;

    var price = config.price;

    var quotient = Math.floor(config.amount / config.unit);
    var remainder = config.amount % config.unit;

    for (let index = 0; index < quotient; index++) {
        quoine.neworder(config.product_id, config.unit, price, config.side, function (response) {
            console.log(response.id);
        });
        price = (price - interval).toFixed(8);
    }
    quoine.neworder(config.product_id, remainder, price, config.side, function (response) {
        console.log(response.id);
    });
} else {
    console.log('Can not find config file');
}