const express = require('express');
const fetch = require("node-fetch");


const router = express.Router();

router.use(express.static('./views'));

const hmsSupplyUrl = 'https://explorer.hemis.tech/ext/getmoneysupply';
const url = 'https://api.coingecko.com/api/v3/coins/hemis';
const options = {
  method: 'GET',
  headers: {accept: 'application/json', 'x-cg-demo-api-key': 'CG-yRLVZSTjfpp7LTookygo85VM'}
};

//CONSTANTS (1 block per min)
const minPerHour = 60
const hrPerDay = 24
const daysPerYear = 365
const annualBlocks = minPerHour * hrPerDay * daysPerYear

const rewardsPerBlock = 5.34999999
const annualRewards = annualBlocks * rewardsPerBlock


// /hemis/staking-calculator (Staking page)
router.get('/staking-calculator', async (req, res) => {
  try {
    const response = await fetch(url, options);
    const json = await response.json();
    const currentPrice = json.market_data.current_price;
    const usd = currentPrice.usd;
    const btc = currentPrice.btc;
    const eth = currentPrice.eth;
    // const marketCapUsd = json.market_data.market_cap.usd;
    const dailyVolume24hUsd = json.market_data.total_volume.usd;
    let priceChangePercentage24h = json.market_data.price_change_percentage_24h;
    // const totalSupply = json.market_data.total_supply;

    // Fetch total supply from Hemis explorer
    const totalSupplyResponse = await fetch(hmsSupplyUrl);
    const totalSupply = await totalSupplyResponse.text(); // Get the response as text

    // Parse total supply as float
    const totalSupplyFloat = parseFloat(totalSupply);

    // Calculate total market cap
    const marketCapUsd = usd * totalSupplyFloat;
    
    // Calculate apy
    const apy = (annualRewards / totalSupplyFloat) * 100;


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
      market_cap_USD: marketCapUsd.toFixed(2),
      daily_volume_24h_USD: dailyVolume24hUsd,
      price_change_percentage_24h: priceChangePercentage24h,
      total_supply: totalSupply,
      ROI: apy.toFixed(2)
    };
    console.log(selectedMarketData);
    res.render('hms-staking', { marketData: selectedMarketData });
  } catch (error) {
    console.error('error: ' + error);
    res.status(500).render('hms-staking', { marketData: null, error: error.message });
  }
});

//Hemis Staking Calculate hms
router.post('/staking-calculate/hms', async (req, res) => {
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
      userPeriodDays: periodDays,
      userStakedCoins: userStakedCoins,
      current_price: currentPrice,
      userDaysReward: rewardSpecifiedPeriod,
      other_periods: {
        day1Reward: reward1Day,
        days7Reward: reward7Days,
        days30Reward: reward30Days,
        days90Reward: reward90Days,
        days365Reward: reward365Days,
      },
      ROI: apy.toFixed(2)
    };

    res.status(200).json({
      message: 'Hemis reward for the specified period fetched successfully.',
      data_from: 'CoinGecko.com',
      reward_data: rewardData
    });
  } catch (error) {
    console.error('error: ' + error);
    res.status(500).json({
      data: null,
      error: error.toString()
    });
  }
});

//Hemis Staking Calculate USD
router.post('/staking-calculate/usd', async (req, res) => {
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
    const userStakedUsd = parseFloat(req.body.usd_amount)

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
      userPeriodDays: periodDays,
      userStakedUsd: userStakedUsd,
      userStakedCoins: userStakedCoins,
      current_price: currentPrice,
      userDaysReward: rewardSpecifiedPeriod,
      other_periods: {
        day1Reward: reward1Day,
        days7Reward: reward7Days,
        days30Reward: reward30Days,
        days90Reward: reward90Days,
        days365Reward: reward365Days,
      },
      ROI: apy.toFixed(2)
    };

    res.status(200).json({
      message: 'Hemis reward for the specified period fetched successfully.',
      data_from: 'CoinGecko.com',
      reward_data: rewardData
    });
  } catch (error) {
    console.error('error: ' + error);
    res.status(500).json({
      data: null,
      error: error.toString()
    });
  }
});


// error page
router.get('*', (req, res) => {
  res.render('404');
})

module.exports = router;