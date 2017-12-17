var request = require('request');
var cron = require('node-cron');
var async = require('async');

var qryptos = require('./qryptos');
var config = require('./config');

cron.schedule('*/5 * * * * *', function () {
    async.parallel({
        poloniex: function (callback) {
            request.get({
                url: 'https://poloniex.com/public?command=returnTicker',
                json: true
            }, function (error, response, body) {
                try {
                    callback(null, body);
                } catch (e) {
                    return callback(e);
                }
            });
        },
        qryptos: function (callback) {
            request.get({
                url: 'https://api.qryptos.com/products/' + config.product_id + '/price_levels',
                json: true
            }, function (error, response, body) {
                try {
                    callback(null, body);
                } catch (e) {
                    return callback(e);
                }
            });
        }
    }, function (err, results) {
        if (err) {
            console.log(err);
        } else {
            var poloniex_price = poloniex.USDT_STR.last / poloniex.USDT_ETH.last;

            var buy = qryptos.buy_price_levels[0];
            var buy_price = buy[0];
            var buy_quantity = buy[1];
            var sell = qryptos.buy_price_levels[0];

            if (config.side == 'buy') {
                if (config.price >= poloniex_price) {
                    //cancel
                } else {
                    //check status
                    if (config.price >= buy_price && config.quantity == buy.buy_quantity) {
                        //first order
                    } else {
                        //edit order
                    }
                }
            }
        }
    });
});