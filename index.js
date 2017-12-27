var request = require('request');
var cron = require('node-cron');
var async = require('async');

var client = require('./quoine');

var config = process.argv.slice(2);
if (config.length) {
    config = require('./' + config);

    var qryptos = new client(config);

    var interval = 0.00000001;
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
                qryptos.order(config.id, function (response) {
                    callback(null, response);
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
                if (results.order.status != 'live') {
                    console.log('The order id %s %s %s status is %s', config.id, results.order.side, results.order.currency_pair_code, results.order.status);
                    process.exit();
                }

                if (results.order.filled_quantity > 0) {
                    console.log('The %s %s filled quantity %s', results.order.side, results.order.currency_pair_code, results.order.filled_quantity);
                    process.exit();
                }

                var coinmarketcap_price = results.coinmarketcap.find(item => item.symbol == config.symbol)['price_' + config.currency.toLowerCase()];
                var current_price = results.order.price;
                var quantity = results.order.quantity;

                var book = results.book;

                var buy = book.buy_price_levels[0];
                var buy_second = book.buy_price_levels[1];
                var buy_price = parseFloat(buy[0]);
                var buy_quantity = parseFloat(buy[1]);

                var sell = book.sell_price_levels[0];
                var sell_second = book.sell_price_levels[1];
                var sell_price = parseFloat(sell[0]);
                var sell_quantity = parseFloat(sell[1]);

                if (config.side == 'buy') {
                    //buy
                    var profit = (sell_price - current_price) / current_price;
                    console.log('profit: ' + (profit * 100).toFixed(2) + '%');
                    if (current_price < coinmarketcap_price && profit >= config.profit) {
                        //check status
                        var change = false;
                        if (current_price >= buy_price && quantity == buy_quantity) {
                            //check second order
                            var difference = (current_price - buy_second[0]).toFixed(8);
                            if (difference > interval) {
                                change = true;
                                current_price = parseFloat(buy_second[0]) + interval;
                            }
                        } else {
                            //edit order to be first order
                            change = true;
                            current_price = buy_price + interval;
                        }

                        if (change) {
                            current_price = current_price.toFixed(8);
                            qryptos.editorder(config.id, current_price, quantity, function (data) {
                                console.log('Change price: ' + current_price + ', profit: ' + (profit * 100).toFixed(2) + '%');
                            });
                        }
                    } else {
                        if (current_price > coinmarketcap_price) {
                            console.log('buy %s > %s(coinmarket price)', current_price, coinmarketcap_price);
                        }
                        if (profit < config.profit) {
                            console.log('buy %s < %s(config profit)', profit, config.profit);
                        }
                        //cancel order
                        qryptos.cancelorder(config.id, function (response) {
                            console.log('Cancel order ' + config.id);
                            process.exit();
                        });
                    }
                } else {
                    //sell
                    var profit = (sell_price - config.cost) / config.cost;
                    console.log('profit: ' + (profit * 100).toFixed(2) + '%');
                    if (current_price > coinmarketcap_price && profit >= config.profit) {
                        var change = false;
                        if (current_price <= sell_price && quantity == sell_quantity) {
                            //check second order
                            var difference = (sell_second[0] - current_price).toFixed(8);
                            if (difference > interval) {
                                change = true;
                                current_price = parseFloat(sell_second[0]) - interval;
                            }
                        } else {
                            //edit order to be first order
                            change = true;
                            current_price = sell_price - interval;
                        }

                        if (change) {
                            current_price = current_price.toFixed(8);
                            qryptos.editorder(config.id, current_price, quantity, function (data) {
                                console.log('Change price: ' + current_price + ', profit: ' + (profit * 100).toFixed(2) + '%');
                            });
                        }
                    } else {
                        if (current_price < coinmarketcap_price) {
                            console.log('sell %s < %s(coinmarket price)', current_price, coinmarketcap_price);
                        }
                        if (profit < config.profit) {
                            console.log('sell %s < %s(config profit)', profit, config.profit);
                        }
                        //cancel order
                        qryptos.cancelorder(config.id, function (response) {
                            console.log('Cancel order ' + config.id);
                            process.exit();
                        });
                    }
                }
            }
        });
    });
} else {
    console.log('Can not find config file');
}