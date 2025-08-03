const express = require("express");

const router = express.Router();

router.get('/trending', async (req, res) => {
  try {
    const url = `${process.env.BASE_URL}/users/trending?limit=20`;
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

  router.get("/tracks/trending", async (req, res) => {
    try {
        const r = await fetch(`${process.env.BASE_URL}/tracks/trending`);
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

        if(type === 'track'){
            endpoint = `${process.env.BASE_URL}/tracks/search?query=${encodeURIComponent(q)}`;
        }else{
            endpoint = `${process.env.BASE_URL}/users/search?query=${encodeURIComponent(q)}`;
        }

        const r = await fetch(endpoint);
        const data = await r.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search failed' });
    }
  })    

  module.exports = router;