export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed', method: req.method });
    return;
  }

  try {
    const { endpoint, data } = req.body;
    
    if (!endpoint || !data) {
      res.status(400).json({ error: 'Missing endpoint or data' });
      return;
    }
    
    const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
    const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
    
    if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
      res.status(500).json({ error: 'Cloudflare credentials not configured' });
      return;
    }
    
    const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if this is an image generation endpoint
    const isImageEndpoint = endpoint.includes('stable-diffusion') || endpoint.includes('image');
    
    if (isImageEndpoint) {
      // Handle image response (binary data)
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      
      res.status(200).json({
        success: true,
        result: base64,
        type: 'image'
      });
    } else {
      // Handle text response (JSON)
      const text = await response.text();
      
      // Check if response is empty
      if (!text) {
        throw new Error('Empty response from Cloudflare AI');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
      }
      
      res.status(200).json(result);
    }
  } catch (error) {
    console.error('AI Proxy Error:', error);
    res.status(500).json({ 
      error: error.message,
      success: false 
    });
  }
} 