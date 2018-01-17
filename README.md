# Spread

## Config
index config
``` javascript
module.exports = {
    token_id: 'xxx',
    user_secret: 'xxx',
    id: '6267800', //order id
    product_id: '5',
    symbol: 'ETC',
    currency: 'BTC',
    side: 'buy',
    profit: 0.1,
    cost: 0
}
```
cmc config
``` javascript
module.exports = {
    base_url: 'https://api.quoine.com/',
    token_id: 'xxx',
    user_secret: 'xxx',
    id: '159834032', //order id
    symbol: 'QASH',
    currency: 'SGD',
    side: 'buy',
    discount: 0.8
}
```
order config
``` javascript
module.exports = {
    base_url: 'https://api.quoine.com/',
    token_id: 'xxx',
    user_secret: 'xxx',
    product_id: '51',
    side: 'sell',
    price: 0.00169998,
    amount: 150,
    unit: 20
}
```

## Start 
First order to buy or sell

    node index.js config.js

Follow coinmarketcap price change to buy

    node cmc.js config.js

Make multi order to buy or sell

    node order.js config.js
