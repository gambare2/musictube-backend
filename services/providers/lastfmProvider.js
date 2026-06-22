const axios = require('axios');

const BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

const getApiKey = () => {
    return process.env.LASTFM_API_KEY || 'd30c5e3f16ff36113b28bdf0647c0c1b'; // Fallback for safety if api key is missing during boot
};

// Helper to extract image URL from Last.fm image array
const extractImage = (imageArray, size = 'large') => {
    if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) {
        return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
    }
    const found = imageArray.find(img => img.size === size);
    return found && found['#text'] ? found['#text'] : imageArray[imageArray.length - 1]['#text'] || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300';
};

// 1. Search Artists
const searchArtists = async (query, limit = 20) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'artist.search',
                artist: query,
                api_key: getApiKey(),
                format: 'json',
                limit
            }
        });
        
        const results = response.data?.results?.artistmatches?.artist || [];
        return results.map(art => ({
            id: art.name, // Use name as ID since it's unique enough for search requests
            name: art.name,
            mbid: art.mbid || '',
            image: extractImage(art.image),
            listeners: parseInt(art.listeners) || 0
        }));
    } catch (err) {
        console.error('[Last.fm API Error] searchArtists failed:', err.message);
        return [];
    }
};

// 2. Get Artist Info
const getArtistInfo = async (artistName) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'artist.getinfo',
                artist: artistName,
                api_key: getApiKey(),
                format: 'json'
            }
        });

        const art = response.data?.artist;
        if (!art) return null;

        return {
            name: art.name,
            mbid: art.mbid || '',
            image: extractImage(art.image, 'extralarge'),
            biography: art.bio?.summary || art.bio?.content || '',
            listeners: parseInt(art.stats?.listeners) || 0,
            playcount: parseInt(art.stats?.playcount) || 0,
            tags: Array.isArray(art.tags?.tag) ? art.tags.tag.map(t => t.name) : (art.tags?.tag ? [art.tags.tag.name] : []),
            similar: Array.isArray(art.similar?.artist) 
                ? art.similar.artist.map(s => ({ id: s.name, name: s.name, image: extractImage(s.image) })) 
                : []
        };
    } catch (err) {
        console.error('[Last.fm API Error] getArtistInfo failed:', err.message);
        return null;
    }
};

// 3. Get Similar Artists
const getSimilarArtists = async (artistName, limit = 6) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'artist.getsimilar',
                artist: artistName,
                api_key: getApiKey(),
                format: 'json',
                limit
            }
        });

        const results = response.data?.similarartists?.artist || [];
        return results.map(art => ({
            id: art.name,
            name: art.name,
            mbid: art.mbid || '',
            image: extractImage(art.image)
        }));
    } catch (err) {
        console.error('[Last.fm API Error] getSimilarArtists failed:', err.message);
        return [];
    }
};

// 4. Get Tag Top Tracks (Tracks in Genre)
const getTagTopTracks = async (tagName, limit = 30) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'tag.gettoptracks',
                tag: tagName,
                api_key: getApiKey(),
                format: 'json',
                limit
            }
        });

        const results = response.data?.tracks?.track || [];
        return results.map(t => ({
            id: t.name + ' - ' + t.artist?.name, // Use composite string as fallback ID
            name: t.name,
            artist_name: t.artist?.name || '',
            album_image: extractImage(t.image, 'large'),
            duration: 180 // Last.fm top tracks don't always provide duration, default to 3 minutes
        }));
    } catch (err) {
        console.error('[Last.fm API Error] getTagTopTracks failed:', err.message);
        return [];
    }
};

// 5. Get Tag Top Artists (Artists in Genre)
const getTagTopArtists = async (tagName, limit = 10) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'tag.gettopartists',
                tag: tagName,
                api_key: getApiKey(),
                format: 'json',
                limit
            }
        });

        const results = response.data?.topartists?.artist || [];
        return results.map(art => ({
            id: art.name,
            name: art.name,
            mbid: art.mbid || '',
            image: extractImage(art.image)
        }));
    } catch (err) {
        console.error('[Last.fm API Error] getTagTopArtists failed:', err.message);
        return [];
    }
};

// 6. Get Global Trending Artists (chart.gettopartists)
const getTrendingArtists = async (limit = 10) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: {
                method: 'chart.gettopartists',
                api_key: getApiKey(),
                format: 'json',
                limit
            }
        });

        const results = response.data?.artists?.artist || [];
        return results.map(art => ({
            id: art.name,
            name: art.name,
            mbid: art.mbid || '',
            image: extractImage(art.image),
            listeners: parseInt(art.listeners) || 0
        }));
    } catch (err) {
        console.error('[Last.fm API Error] getTrendingArtists failed:', err.message);
        return [];
    }
};

module.exports = {
    searchArtists,
    getArtistInfo,
    getSimilarArtists,
    getTagTopTracks,
    getTagTopArtists,
    getTrendingArtists
};
