import type { VercelRequest, VercelResponse } from '@vercel/node';

const POSTHOG_HOST = 'https://us.i.posthog.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Get the path after /api/v2/
  const { path } = req.query;
  const pathString = Array.isArray(path) ? path.join('/') : path || '';
  
  // Build the target URL with query params
  const targetUrl = new URL(`/${pathString}`, POSTHOG_HOST);
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && typeof value === 'string') {
      targetUrl.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' 
        ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body))
        : undefined,
    });

    const data = await response.text();
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).send(data);
  } catch (error) {
    console.error('PostHog proxy error:', error);
    res.status(500).json({ error: 'Proxy error' });
  }
}
