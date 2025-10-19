const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/prices', async (req, res) => {
  try {
    // Fetch from CoinGecko
    const coinGeckoResponse = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin&vs_currencies=usd'
    );
    const coinGeckoData = await coinGeckoResponse.json();

    // JUSDC price - using current market price as default
    const prices = {
      ...coinGeckoData,
      'jusdc': { usd: 0.945 }
    };

    res.json(prices);
  } catch (error) {
    console.error('Price fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch prices',
      'usd-coin': { usd: 1 },
      'jusdc': { usd: 0.945 }
    });
  }
});

const PORT = 3003;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Price proxy running on http://0.0.0.0:${PORT}`);
});
