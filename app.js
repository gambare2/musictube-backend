import express from 'express';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config(
   {
     path: './.env'
   }
)
const app = express();


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🎵 MusicTube API is running!");
});


app.get("/api/trending-tracks", async (req, res) => {
    try {
        const response = await axios.get('https://api.audius.co/v1/tracks/trending?limit=10');
        res.json( response.data );
    } catch (error) {
        console.error("❌ Error fetching artist:");
        console.error(error.response?.data || error.message || error);
        res.status(500).json({ error: "Unable to fetch tracks" });
    }
})

app.get("/api/trending-artist", async (req, res) => {

  try {
    const response = await axios.get("https://api.audius.co/v1/tracks/trending?limit=10");
    res.json(response.data);
  } catch (error) {
    console.error("❌ Error fetching artist:");
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: "Unable to fetch artist" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen (PORT, () => {
    console.log(`✅Server is running on port http://localhost:${PORT}`);
});
export default app;