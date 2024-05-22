    document.addEventListener('DOMContentLoaded', function() {
      function updatePriceChangeColor() {
        const priceChangeElement = document.getElementById('price-change-24h');
        let priceChangeValue = priceChangeElement.innerText.replace('%', '').replace('+', '');
        priceChangeValue = parseFloat(priceChangeValue);

        if (priceChangeValue >= 0) {
          priceChangeElement.classList.add('positive');
          priceChangeElement.classList.remove('negative');
        } else {
          priceChangeElement.classList.add('negative');
          priceChangeElement.classList.remove('positive');
        }
      }

      function formatValues() {
        const priceUsdElement = document.getElementById('price-usd');
        const marketCapElement = document.getElementById('market-cap');
        const dailyVolumeElement = document.getElementById('daily-volume');

        // priceUsdElement.innerText = "$" + formatNumberWithCommas(parseFloat(priceUsdElement.innerText.replace('$', '')));
        marketCapElement.innerText = "$" + formatNumberWithCommas(parseFloat(marketCapElement.innerText.replace('$', '')));
        dailyVolumeElement.innerText = "$" + formatNumberWithCommas(parseFloat(dailyVolumeElement.innerText.replace('$', '')));
      }
      updatePriceChangeColor();
      formatValues();


      const conversionRates = {
        USD: parseFloat(document.getElementById('usd-rate').value),
        BTC: parseFloat(document.getElementById('btc-rate').value),
        ETH: parseFloat(document.getElementById('eth-rate').value)
      };
  
      function formatNumberWithCommas(value, excludeCommas = false) {
        if (excludeCommas) {
          return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "");
        }
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

  
      function formatToDecimalPlaces(value, decimalPlaces) {
        return parseFloat(value).toFixed(decimalPlaces);
      }
  
      function updatePlaceholderAndConvert() {
        const hmsPlaceholder = 10000;
        const currencySelect = document.getElementById('currency-select').value;
        const convertedValue = formatToDecimalPlaces(hmsPlaceholder * conversionRates[currencySelect], currencySelect === 'USD' ? 2 : 8);
  
        document.getElementById('currency-amount').placeholder = formatNumberWithCommas(convertedValue, true);
        convertHMS();
      }
  
      function handleHMSInput() {
        const hmsInput = document.getElementById('hms-amount');
        const hmsAmount = hmsInput.value;
  
        // Limit to 7 digits
        if (hmsAmount.length > 7) {
          hmsInput.value = hmsAmount.slice(0, 7);
        }
  
        convertHMS();
      }
  
      function convertHMS() {
        const hmsAmount = parseInt(document.getElementById('hms-amount').value);
        const currencySelect = document.getElementById('currency-select').value;

        if (!isNaN(hmsAmount)) {
          let convertedValue = hmsAmount * conversionRates[currencySelect];
          if (currencySelect !== 'USD') {
            convertedValue = formatToDecimalPlaces(convertedValue, 8);
            document.getElementById('currency-amount').value = formatNumberWithCommas(convertedValue, true);
          } else {
            convertedValue = formatToDecimalPlaces(convertedValue, 2);
            document.getElementById('currency-amount').value = formatNumberWithCommas(convertedValue);
          }
        } else {
          document.getElementById('currency-amount').value = '';
        }
      }

  
      function convertCurrency() {
        const currencyAmountInput = document.getElementById('currency-amount');
        let currencyAmount = currencyAmountInput.value.replace(/,/g, '');
        const currencySelect = document.getElementById('currency-select').value;

        currencyAmount = parseFloat(currencyAmount);

        if (!isNaN(currencyAmount)) {
          let convertedValue;
          if (currencySelect !== 'USD') {
            convertedValue = parseFloat((currencyAmount / conversionRates[currencySelect]).toFixed(8));
          } else {
            convertedValue = Math.floor(currencyAmount / conversionRates[currencySelect]);
            // Limit to 2 decimal places for USD
            convertedValue = parseFloat(convertedValue.toFixed(2));
          }

          // Update the input value with the correct number of decimal places
          document.getElementById('hms-amount').value = convertedValue;
        } else {
          document.getElementById('hms-amount').value = '';
        }
      }

      document.getElementById('hms-amount').addEventListener('input', handleHMSInput);
      document.getElementById('currency-amount').addEventListener('input', convertCurrency);
      document.getElementById('currency-select').addEventListener('change', updatePlaceholderAndConvert);
  
      // Set the initial placeholder for the currency amount input
      updatePlaceholderAndConvert();
    });

    function createResultHTMLHms(data) {
      return `
        <h3>User Reward for ${data.userPeriodDays} Days</h3>
        <ul>
          <li>Staked Amount: ${data.userStakedCoins.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
          <li>Current Price: $${data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>Reward: ${data.userDaysReward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
        </ul>
        <h3>Other Period Rewards</h3>
        <ul>
          <li>1 Day Reward: ${data.other_periods.day1Reward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
          <li>7 Days Reward: ${data.other_periods.days7Reward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
          <li>30 Days Reward: ${data.other_periods.days30Reward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
          <li>90 Days Reward: ${data.other_periods.days90Reward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
          <li>1 Year Reward: ${data.other_periods.days365Reward.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS</li>
        </ul>
      `;
    }

    function createResultHTMLUsd(data) {
      return `
        <h3>User Reward for ${data.userPeriodDays} Days</h3>
        <ul>
          <li>Staked Amount: $${parseFloat(data.userStakedUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${data.userStakedCoins.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} HMS)</li>
          <li>Current Price: $${data.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>Reward: $${data.userDaysReward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
        </ul>
        <h3>Other Period Rewards</h3>
        <ul>
          <li>1 Day Reward: $${data.other_periods.day1Reward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>7 Days Reward: $${data.other_periods.days7Reward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>30 Days Reward: $${data.other_periods.days30Reward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>90 Days Reward: $${data.other_periods.days90Reward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
          <li>1 Year Reward: $${data.other_periods.days365Reward.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</li>
        </ul>
      `;
    }

    function restrictInputLength(element, maxLength) {
      element.addEventListener('input', function () {
        if (this.value.length > maxLength) {
          this.value = this.value.slice(0, maxLength);
        }
      });
    }

    document.getElementById('hms-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      const hmsAmount = document.getElementById('hms_amount').value;
      const periodDays = document.getElementById('hms_period_days').value;
      
      const response = await fetch('/hemis/staking-calculate/hms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hms_amount: hmsAmount, period_days: periodDays })
      });
        
      const result = await response.json();
      document.getElementById('hms-result').innerHTML = createResultHTMLHms(result.reward_data);
    });

    document.getElementById('usd-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      const usdAmount = document.getElementById('usd_amount').value;
      const periodDays = document.getElementById('usd_period_days').value;
      
      const response = await fetch('/hemis/staking-calculate/usd', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usd_amount: usdAmount, period_days: periodDays })
      });
      
      const result = await response.json();
      document.getElementById('usd-result').innerHTML = createResultHTMLUsd(result.reward_data);
    });

    // Restrict input length for HMS and USD amount fields
    restrictInputLength(document.getElementById('hms_amount'), 7);
    restrictInputLength(document.getElementById('usd_amount'), 7);
    restrictInputLength(document.getElementById('hms_period_days'), 3);
    restrictInputLength(document.getElementById('usd_period_days'), 3);
    restrictInputLength(document.getElementById('currency-amount'), 7);