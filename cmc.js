var request = require('request');
var cron = require('node-cron');
var async = require('async');

var client = require('./quoine');

var config = process.argv.slice(2);
if (config.length) {
    config = require('./' + config);

    var quoine = new client(config);

    var interval = 0.00000001;
    cron.schedule('*/5 * * * * *', function () {
        async.parallel({
            coinmarketcap: function (callback) {
                request.get({
                    url: 'https://api.coinmarketcap.com/v1/ticker/?convert=' + config.currency,
                    json: true
                }, function (error, response, body) {
                    try {
                        callback(null, body);
                    } catch (e) {
                        return callback(e);
                    }
                });
            },
            order: function (callback) {
                quoine.order(config.id, function (response) {
                    callback(null, response);
                });
            }
        }, function (err, results) {
            if (err) {
                console.log(err);
            } else {
                if (results.order.status != 'live') {
                    console.log('The order id %s %s %s status is %s', config.id, results.order.side, results.order.currency_pair_code, results.order.status);
                    process.exit();
                }

                if (results.order.filled_quantity > 0) {
                    console.log('The %s %s filled quantity %s', results.order.side, results.order.currency_pair_code, results.order.filled_quantity);
                    process.exit();
                }

                var price = results.order.price;
                console.log('Price: ' + price);
                var quantity = results.order.quantity;
                var cmc = results.coinmarketcap.find(item => item.symbol == config.symbol);
                var cmc_price = (cmc['price_' + config.currency.toLowerCase()] * config.discount).toFixed(4);

                if (cmc_price != price) {
                    //edit order
                    quoine.editorder(config.id, price, quantity, function (data) {
                        console.log('Change price: ' + cmc_price);
                    });
                }
            }
        });
    });
} else {
    console.log('Can not find config file');
}