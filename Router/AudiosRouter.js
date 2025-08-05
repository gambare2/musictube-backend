const express = require("express");

const router = express.Router();

router.get('/artists', async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/artists/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json`;
    console.log('[DEBUG] Fetching:', url);

    const response = await fetch(url); 
    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    res.json(data);
  } catch (err) {
    console.error('[ERROR] Fetching trending artists:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending artists' });
  }
});

  router.get("/tracks", async (req, res) => {
    try {
        const r = await fetch(`${process.env.BASE_URL}/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json`);
        const data = await r.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch trending tracks' });
    }
  })

  router.get('/search', async (req, res) => {
    try {
      const q = req.query.q || '';
      const type = req.query.type || 'artist';
  
  
      let endpoint = '';
  
      if (type === 'track') {
        endpoint = `${process.env.BASE_URL}/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json&namesearch=${encodeURIComponent(q)}&limit=50`;
      } else {
        // default to artist search
        endpoint = `${process.env.BASE_URL}/artists/?client_id=${process.env.JAMENDO_CLIENT_ID}&format=json&namesearch=${encodeURIComponent(q)}&limit=50`;
      }
  
      console.log('[DEBUG] Jamendo Search URL:', endpoint);
  
      const r = await fetch(endpoint);
      const data = await r.json();
      res.json(data);
    } catch (err) {
      console.error('[ERROR] Search failed:', err.message);
      res.status(500).json({ error: 'Search failed' });
    }
  });  

  module.exports = router;