const GEO_REGIONS = [
  { id: 'russia_ukraine', f: '🇺🇦', lon: 32, lat: 49, c: 'r', keywords: ['ukraine', 'russia', 'moscow', 'kyiv', 'zelensky', 'putin', 'kremlin'] },
  { id: 'middle_east', f: '🇮🇱', lon: 35, lat: 31, c: 'r', keywords: ['israel', 'gaza', 'hamas', 'palestine', 'netanyahu', 'hezbollah', 'west bank'] },
  { id: 'iran', f: '🇮🇷', lon: 53, lat: 33, c: 'r', keywords: ['iran', 'tehran', 'sanctions', 'iaea', 'nuclear', 'khamenei'] },
  { id: 'taiwan', f: '🇹🇼', lon: 121, lat: 24, c: 'a', keywords: ['taiwan', 'strait', 'tsmc', 'pla', 'china military'] },
  { id: 'northkorea', f: '🇰🇵', lon: 127, lat: 40, c: 'a', keywords: ['north korea', 'pyongyang', 'kim jong', 'missile', 'icbm'] },
  { id: 'china', f: '🇨🇳', lon: 104, lat: 35, c: 'a', keywords: ['china economy', 'beijing', 'yuan', 'pmi china', 'trade war'] },
  { id: 'usa', f: '🇺🇸', lon: -98, lat: 38, c: 'g', keywords: ['federal reserve', 'fed rates', 'trump', 'white house', 'congress'] },
  { id: 'europe', f: '🇪🇺', lon: 10, lat: 51, c: 'a', keywords: ['ecb', 'eurozone', 'germany recession', 'nato', 'europe energy'] },
  { id: 'africa', f: '🌍', lon: 8, lat: 9, c: 'r', keywords: ['nigeria', 'sahel', 'coup', 'burkina', 'mali', 'sudan', 'congo'] },
  { id: 'latam', f: '🌎', lon: -65, lat: -15, c: 'a', keywords: ['venezuela', 'argentina', 'brazil', 'colombia', 'lithium', 'chile'] },
  { id: 'india', f: '🇮🇳', lon: 78, lat: 20, c: 'gr', keywords: ['india economy', 'modi', 'sensex', 'rupee'] },
  { id: 'uk', f: '🇬🇧', lon: -2, lat: 54, c: 'g', keywords: ['uk economy', 'pound', 'bank of england', 'ftse'] },
  { id: 'turkey', f: '🇹🇷', lon: 35, lat: 39, c: 'a', keywords: ['turkey', 'erdogan', 'lira', 'istanbul', 'ankara'] },
  { id: 'pakistan', f: '🇵🇰', lon: 69, lat: 30, c: 'r', keywords: ['pakistan', 'islamabad', 'imf pakistan', 'kashmir'] },
  { id: 'japan', f: '🇯🇵', lon: 138, lat: 36, c: 'g', keywords: ['bank of japan', 'boj', 'yen', 'nikkei', 'tokyo'] },
];

function timeAgo(dateStr) {
  if (!dateStr) return 'Reciente';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `Hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Hace ${h}h`;
  return `Hace ${Math.floor(h / 24)}d`;
}

export default async function handler(req, res) {
  const NEWS_KEY = process.env.NEWS_API_KEY;

  try {
    const url = `https://newsapi.org/v2/everything?q=geopolitics+OR+war+OR+sanctions+OR+ukraine+OR+israel+OR+iran+OR+conflict+OR+economy&language=en&sortBy=publishedAt&pageSize=50&apiKey=${NEWS_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    const articles = data.articles || [];

    const events = GEO_REGIONS.map(region => {
      const relevant = articles.filter(a => {
        const text = (a.title + ' ' + (a.description || '')).toLowerCase();
        return region.keywords.some(k => text.includes(k));
      });

      if (!relevant.length) return null;

      const top = relevant[0];
      return {
        ...region,
        t: top.title.length > 80 ? top.title.substring(0, 77) + '...' : top.title,
        desc: top.description || top.title,
        s: (top.source?.name || 'Reuters') + ' · ' + timeAgo(top.publishedAt),
        url: top.url,
        r: region.c === 'r' ? 'Riesgo alto' : region.c === 'a' ? 'Riesgo medio' : region.c === 'gr' ? 'Oportunidad' : 'Monitorizando',
        rc: region.c,
        count: relevant.length,
        articles: relevant.slice(0, 3).map(a => ({
          title: a.title,
          source: a.source?.name,
          url: a.url,
          publishedAt: a.publishedAt
        }))
      };
    }).filter(Boolean);

    res.status(200).json({ events, total: events.length, updated: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ error: 'Error processing events', detail: error.message });
  }
}
