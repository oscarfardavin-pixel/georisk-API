export default async function handler(req, res) {
  const AV_KEY = process.env.ALPHA_VANTAGE_KEY;
  const { symbol = 'IBM', type = 'stock' } = req.query;

  try {
    let url;
    if (type === 'forex') {
      const { from = 'EUR', to = 'USD' } = req.query;
      url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${AV_KEY}`;
    } else {
      url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`;
    }
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching market data' });
  }
}
