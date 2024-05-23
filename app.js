const express = require('express');
const bodyparser = require("body-parser")
const fetch = require("node-fetch");
const viewRouter = require('./views/views-router');


const port = 3000;


const app = express();

app.use(bodyparser.urlencoded({ extended: true }));

app.use(bodyparser.json())

app.set('view engine', 'ejs')


app.use('/hemis', viewRouter)

// home route
app.get('/', (req, res) => {
  return res.status(200).json({ message: 'success', status: true })
})

const hmsSupplyUrl = 'https://explorer.hemis.tech/ext/getmoneysupply';
const url2 = 'https://api.coingecko.com/api/v3/coins/bitcoin';
const url = 'https://api.coingecko.com/api/v3/coins/hemis';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-yRLVZSTjfpp7LTookygo85VM'}
};

//Hemis Entire Data
app.get('/hms', async (req, res) => {
  try {
    const response = await fetch(url, options)
    const json = await response.json();
    console.log(json);
    return res.status(200).json({
      message: 'Hemis data fetched successfully.',
      data_from: 'CoinGecko.com',
      data: json
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Hemis Market Data
app.get('/hms/market-data', async (req, res) => {
  try {
    const response = await fetch(url, options)
    const json = await response.json();
    const marketData = json.market_data
    console.log(marketData);
    return res.status(200).json({
      message: 'Hemis market data fetched successfully.',
      data_from: 'CoinGecko.com',
      data: marketData
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Hemis Current Price
app.get('/hms/market-data/current-price', async (req, res) => {
  try {
    const response = await fetch(url, options)
    const json = await response.json();
    const currentPrice = json.market_data.current_price
    const usd = currentPrice.usd
    const btc = currentPrice.btc
    const eth = currentPrice.eth
    const selectedCurrentPrice = {
      USD: usd,
      BTC: btc,
      ETH: eth
    }
    console.log(selectedCurrentPrice);
    return res.status(200).json({
      message: 'Hemis Current Price fetched successfully.',
      data_from: 'CoinGecko.com',
      current_price: selectedCurrentPrice
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Hemis Selected Market Data
app.get('/hms/market', async (req, res) => {
  try {
    const response = await fetch(url, options)
    const json = await response.json();
    const currentPrice = json.market_data.current_price
    const usd = currentPrice.usd
    const btc = currentPrice.btc
    const eth = currentPrice.eth
    // const marketCapUsd =  json.market_data.market_cap.usd
    const dailyVolume24hUsd =  json.market_data.total_volume.usd
    let priceChangePercentage24h =  json.market_data.price_change_percentage_24h
    // const totalSupply = json.market_data.total_supply
    // Fetch total supply from Hemis explorer
    const totalSupplyResponse = await fetch(hmsSupplyUrl);
    const totalSupply = await totalSupplyResponse.text(); // Get the response as text

    // Parse total supply as float
    const totalSupplyFloat = parseFloat(totalSupply);

    // Calculate total market cap
    const marketCapUsd = usd * totalSupplyFloat;

    // Add positive/negative sign and percentage symbol
    priceChangePercentage24h = priceChangePercentage24h >= 0 
    ? `+${priceChangePercentage24h.toFixed(2)}%`
    : `${priceChangePercentage24h.toFixed(2)}%`;

    const selectedMarketData = {
      current_price: {
        USD: usd,
        BTC: btc,
        ETH: eth
      },
      market_cap_USD: marketCapUsd,
      daily_volume_24h_USD: dailyVolume24hUsd,
      price_change_percentage_24h: priceChangePercentage24h,
      total_supply: totalSupplyFloat,
    }
    console.log(selectedMarketData);
    return res.status(200).json({
      message: 'Hemis Selected Market Data fetched successfully.',
      data_from: 'CoinGecko.com',
      selected_market_data: selectedMarketData
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//CONSTANTS (1 block per min)
const minPerHour = 60
const hrPerDay = 24
const daysPerYear = 365
const annualBlocks = minPerHour * hrPerDay * daysPerYear

const rewardsPerBlock = 5.34999999
const annualRewards = annualBlocks * rewardsPerBlock



//Hemis Staking Calculate hms
app.post('/hms/staking/calculate/hms', async (req, res) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    const currentPrice = json.market_data.current_price.usd;

    // Fetch total supply from Hemis explorer
    const totalSupplyResponse = await fetch(hmsSupplyUrl);
    const totalSupply = await totalSupplyResponse.text(); // Get the response as text

    // Parse total supply as float
    const totalSupplyFloat = parseFloat(totalSupply);

    // Calculate apy
    const apy = (annualRewards / totalSupplyFloat) * 100;
    const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1;

    const userStakedCoins = parseFloat(req.body.hms_amount);
    const periodDays = parseInt(req.body.period_days);

    const calculateReward = (days) => {
      return userStakedCoins * (Math.pow(1 + dailyRate, days) - 1);
    };

    const reward1Day = calculateReward(1);
    const reward7Days = calculateReward(7);
    const reward30Days = calculateReward(30);
    const reward90Days = calculateReward(90);
    const reward365Days = calculateReward(365);
    const rewardSpecifiedPeriod = calculateReward(periodDays);

    const rewardData = {
      'current_price ($)': currentPrice,
      [`${periodDays}_days_reward (HMS)`]: rewardSpecifiedPeriod,
      
      'other_periods': {
        '1_day_reward (HMS)': reward1Day,
        '7_days_reward (HMS)': reward7Days,
        '30_days_reward (HMS)': reward30Days,
        '90_days_reward (HMS)': reward90Days,
        '365_days_reward (HMS)': reward365Days,
      },
      'ROI (%)': parseFloat(apy.toFixed(2))
    };

    return res.status(200).json({
      message: 'Hemis reward for the specified period fetched successfully.',
      data_from: 'CoinGecko.com',
      reward_data: rewardData
    });
  } catch (error) {
    console.error('error: ' + error);
    return res.status(500).json({
      data: null,
      error: error.toString()
    });
  }
});

//Hemis Staking Calculate USD
app.post('/hms/staking/calculate/usd', async (req, res) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    const currentPrice = json.market_data.current_price.usd;

    // Fetch total supply from Hemis explorer
    const totalSupplyResponse = await fetch(hmsSupplyUrl);
    const totalSupply = await totalSupplyResponse.text(); // Get the response as text

    // Parse total supply as float
    const totalSupplyFloat = parseFloat(totalSupply);

    // Calculate apy
    const apy = (annualRewards / totalSupplyFloat) * 100;
    const dailyRate = Math.pow(1 + apy / 100, 1 / 365) - 1;
    const userStakedUsd = req.body.usd_amount

    const userStakedCoins = parseFloat(userStakedUsd/currentPrice);
    const periodDays = parseInt(req.body.period_days);

    const calculateReward = (days) => {
      return userStakedCoins * (Math.pow(1 + dailyRate, days) - 1);
    };

    const reward1Day = calculateReward(1)*currentPrice;
    const reward7Days = calculateReward(7)*currentPrice;
    const reward30Days = calculateReward(30)*currentPrice;
    const reward90Days = calculateReward(90)*currentPrice;
    const reward365Days = calculateReward(365)*currentPrice;
    const rewardSpecifiedPeriod = calculateReward(periodDays)*currentPrice;

    const rewardData = {
      'current_price ($)': currentPrice,
      'staked_amount (USD)': userStakedUsd,
      'staked_amount (HMS)': userStakedCoins,
      [`${periodDays}_days_reward ($)`]: rewardSpecifiedPeriod,

      'other_periods': {
        '1_day_reward ($)': reward1Day,
        '7_days_reward ($)': reward7Days,
        '30_days_reward ($)': reward30Days,
        '90_days_reward ($)': reward90Days,
        '365_days_reward ($)': reward365Days
      },
      'ROI (%)': parseFloat(apy.toFixed(2))
    };

    return res.status(200).json({
      message: 'Hemis reward for the specified period fetched successfully.',
      data_from: 'CoinGecko.com',
      reward_data: rewardData
    });
  } catch (error) {
    console.error('error: ' + error);
    return res.status(500).json({
      data: null,
      error: error.toString()
    });
  }
});
//////////////////////////////////////////////////////////////////////////////////////////////////////

//Bitcoin Entire Data
app.get('/btc', async (req, res) => {
  try {
    const response = await fetch(url2, options)
    const json = await response.json();
    console.log(json);
    return res.status(200).json({
      message: 'Bitcoin data fetched successfully.',
      data_from: 'CoinGecko.com',
      data: json
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Bitcoin Market Data
app.get('/btc/market-data', async (req, res) => {
  try {
    const response = await fetch(url2, options)
    const json = await response.json();
    const marketData = json.market_data
    console.log(marketData);
    return res.status(200).json({
      message: 'Bitcoin market data fetched successfully.',
      data_from: 'CoinGecko.com',
      data: marketData
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Bitcoin Current Price
app.get('/btc/market-data/current-price', async (req, res) => {
  try {
    const response = await fetch(url2, options)
    const json = await response.json();
    const currentPrice = json.market_data.current_price
    const usd = currentPrice.usd
    const btc = currentPrice.btc
    const eth = currentPrice.eth
    const selectedCurrentPrice = {
      USD: usd,
      BTC: btc,
      ETH: eth
    }
    console.log(selectedCurrentPrice);
    return res.status(200).json({
      message: 'Bitcoin Current Price fetched successfully.',
      data_from: 'CoinGecko.com',
      current_price: selectedCurrentPrice
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

//Bitcoin selected market data
app.get('/btc/market', async (req, res) => {
  try {
    const response = await fetch(url2, options)
    const json = await response.json();
    const currentPrice = json.market_data.current_price
    const usd = currentPrice.usd
    const btc = currentPrice.btc
    const eth = currentPrice.eth
    const marketCapUsd =  json.market_data.market_cap.usd
    const dailyVolume24hUsd =  json.market_data.total_volume.usd
    let priceChangePercentage24h =  json.market_data.price_change_percentage_24h

    // Add positive/negative sign and percentage symbol
    priceChangePercentage24h = priceChangePercentage24h >= 0 
    ? `+${priceChangePercentage24h.toFixed(2)}%`
    : `${priceChangePercentage24h.toFixed(2)}%`;

    const selectedMarketData = {
      current_price: {
        USD: usd,
        BTC: btc,
        ETH: eth
      },
      market_cap_USD: marketCapUsd,
      daily_volume_24h_USD: dailyVolume24hUsd,
      price_change_percentage_24h: priceChangePercentage24h
    }
    console.log(selectedMarketData);
    return res.status(200).json({
      message: 'Bitcoin Selected Market Data fetched successfully.',
      data_from: 'CoinGecko.com',
      selected_market_data: selectedMarketData
    })
  } catch (error) {
    console.error('error: ' + error)
    return res.json({
      data: null,
      error: error
    })
  }
})

// app.get('/hemis', async (req, res) => {
//   fetch(url, options)
//     .then(res => res.json())
//     .then(json => console.log(json))
//     .catch(err => console.error('error:' + err));
// })


app.get('*', (req, res) => {
  return res.status(404).json({
    data: null,
    error: 'Route not found'
  })
})

// global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    data: null,
    error: 'Server Error'
  })
})

app.listen(port, () => console.log(`listening on port: ${port}`));