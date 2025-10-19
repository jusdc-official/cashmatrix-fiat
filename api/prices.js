export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  try {
    // Fetch from CoinGecko
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,usd-coin&vs_currencies=usd',
      { headers: { 'Accept': 'application/json' } }
    );
    
    if (!response.ok) {
      throw new Error('CoinGecko API failed');
    }
    
    const data = await response.json();
    
    // Add JUSDC price
    const prices = {
      bitcoin: data.bitcoin || { usd: 0 },
      ethereum: data.ethereum || { usd: 0 },
      'usd-coin': data['usd-coin'] || { usd: 1 },
      jusdc: { usd: 0.945 }
    };
    
    res.status(200).json(prices);
  } catch (error) {
    console.error('Price API error:', error);
    // Return fallback prices
    res.status(200).json({
      bitcoin: { usd: 107000 },
      ethereum: { usd: 3870 },
      'usd-coin': { usd: 1 },
      jusdc: { usd: 0.945 }
    });
  }
}
