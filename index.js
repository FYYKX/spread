var request = require('request');
var cron = require('node-cron');

var qryptos = require('./qryptos');
var config = require('./config');

qryptos.liveorders(function (data) {
   console.log(data); 
});

cron.schedule('*/5 * * * * *', function () {
    request.get({
        url: "https://api.qryptos.com/products/" + config.product_id + "/price_levels",
        json: true
    }, function (error, response, body) {
        console.log(body.buy_price_levels[0][0]);
        console.log(body.sell_price_levels[0][0]);
    });
});