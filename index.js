var request = require('request');
var cron = require('node-cron');
var async = require('async');

var qryptos = require('./qryptos');
var config = require('./config');

cron.schedule('*/5 * * * * *', function () {
    async.parallel({
        coinmarketcap: function (callback) {
            request.get({
                url: 'https://api.coinmarketcap.com/v1/ticker/?convert=ETH',
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
            qryptos.order(config.id, function (data) {
                callback(null, data);
            });
        },
        book: function (callback) {
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
            var coinmarketcap_price = results.coinmarketcap.find(item => item.symbol == config.symbol).price_eth;

            var current_price = results.order.price;
            var quantity = results.order.quantity;

            var book = results.book;

            var buy = book.buy_price_levels[0];
            var buy_second = book.buy_price_levels[1];
            var buy_price = parseFloat(buy[0]);
            var buy_quantity = buy[1];

            var sell = book.sell_price_levels[0];
            var sell_second = book.sell_price_levels[1];
            var sell_price = parseFloat(sell[0]);
            var sell_quantity = sell[1];

            var profit = (sell_price - current_price) / current_price;

            if (config.side == 'buy') {
                if (current_price < coinmarketcap_price && profit >= config.profit) {
                    //check status
                    var change = false;
                    if (current_price >= buy_price && config.quantity == buy.buy_quantity) {
                        //check second order
                        var spread = (current_price - buy_second[0]).toFixed(8);
                        console.log('spread ' + spread);
                        if (spread > 0.00000001) {
                            change = true;
                            current_price = parseFloat(buy_second[0]) + 0.00000001;
                        }
                    } else {
                        //edit order
                        console.log(current_price + ' ' + buy_price);
                        change = true;
                        current_price = buy_price + 0.00000001;

                        // qryptos.editorder(config.id, current_price, quantity, function (data) {
                        //     console.log('Change price to ' + data.price);
                        // });
                        // qryptos.neworder(config.product_id, '10', '0.00000001', 'buy', function (response) {
                        //     console.log(response);
                        // });
                        // qryptos.cancelorder(config.id, function (response) {
                        //     console.log('Cancel order ' + config.id);
                        // });
                    }

                    if (change) {
                        qryptos.editorder(config.id, current_price, quantity, function (data) {
                            console.log('Change price: ' + current_price + ', profit: ' + profit.toFixed(2) + '%');
                        });
                    }
                }
            }
        }
    });
});