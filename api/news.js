export default async function handler(req, res) {
  const NEWS_KEY = process.env.NEWS_API_KEY;
  
  try {
    const url = `https://newsapi.org/v2/everything?q=geopolitics+OR+war+OR+sanctions+OR+ukraine+OR+israel+OR+iran+OR+conflict&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching news', detail: error.message });
  }
}
