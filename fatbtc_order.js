var request = require('request');
var cron = require('node-cron');
var async = require('async');

var client = require('./fatbtc');

var fatbtc = new client();

var buyPrice = 0.0004;
var ratio = 0.08;

// cron.schedule('*/1 * * * * *', function () {
//     fatbtc.depth("EOSBTC", function (response) {
//         var price = response.bids[0][0]
//         var volume = response.bids[0][1]
//         if ((price - buyPrice)/ buyPrice > ratio) {
//             fatbtc.order(config.id, function (response) {
//                 callback(null, response);
//             });
//         }
//     })
// });

fatbtc.createOrder("EOSBTC", 1, "0.000001", "buy", function (response) {
    console.log(response);
});