const axios = require('axios');

const BASE_URL = 'https://musicbrainz.org/ws/2';

const getHeaders = () => {
    return {
        'User-Agent': process.env.MUSICBRAINZ_USER_AGENT || 'MusicTube/1.0 ( pritube@example.com )'
    };
};

// Get albums/releases by Artist Name or MBID
const getArtistAlbums = async (artistName, artistMbid = '') => {
    try {
        let response;
        if (artistMbid) {
            // Retrieve release groups directly by artist MBID
            response = await axios.get(`${BASE_URL}/release-group`, {
                headers: getHeaders(),
                params: {
                    artist: artistMbid,
                    type: 'album',
                    fmt: 'json',
                    limit: 15
                }
            });
        } else {
            // Query release groups by artist name search query
            response = await axios.get(`${BASE_URL}/release-group`, {
                headers: getHeaders(),
                params: {
                    query: `artist:"${artistName}" AND type:album`,
                    fmt: 'json',
                    limit: 15
                }
            });
        }

        const releaseGroups = response.data['release-groups'] || [];
        return releaseGroups.map(rg => {
            const mbid = rg.id;
            return {
                id: mbid,
                name: rg.title,
                releasedate: rg['first-release-date'] || 'Unknown Date',
                // Direct static redirect cover art URL
                image: mbid ? `https://coverartarchive.org/release-group/${mbid}/front-250` : 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=250'
            };
        });
    } catch (err) {
        console.error('[MusicBrainz API Error] getArtistAlbums failed:', err.message);
        return [];
    }
};

module.exports = {
    getArtistAlbums
};
