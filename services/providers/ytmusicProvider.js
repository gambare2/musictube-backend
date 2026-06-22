const YoutubeMusicApi = require('youtube-music-api');

let apiInstance = null;

const getApi = async () => {
    if (!apiInstance) {
        const api = new YoutubeMusicApi();
        await api.initalize(); // Uses the package's specific spelling
        apiInstance = api;
    }
    return apiInstance;
};

// 1. Search Songs
const searchSongs = async (query, limit = 20) => {
    try {
        const api = await getApi();
        const response = await api.search(query, 'song');
        
        const list = response.content || [];
        const baseUrl = process.env.BASE_URL_LOCAL || `http://localhost:${process.env.PORT || 5000}`;
        
        return list.slice(0, limit).map(item => {
            const artistName = Array.isArray(item.artists) ? item.artists.map(a => a.name).join(', ') : (item.author || 'Unknown Artist');
            const thumbnail = Array.isArray(item.thumbnails) && item.thumbnails.length > 0 ? item.thumbnails[0].url : (item.thumbnail || '/music_cover.png');
            
            return {
                id: item.videoId,
                name: item.name,
                artist_name: artistName,
                audio: `${baseUrl}/api/music/stream/${item.videoId}`, // Stream URL pointing to backend streaming proxy
                album_image: thumbnail,
                duration: item.duration ? Math.round(item.duration / 1000) : 180 // Convert ms to seconds
            };
        });
    } catch (err) {
        console.error('[YTMusic API Error] searchSongs failed:', err.message);
        return [];
    }
};

// 2. Search Albums
const searchAlbums = async (query, limit = 15) => {
    try {
        const api = await getApi();
        const response = await api.search(query, 'album');
        
        const list = response.content || [];
        return list.slice(0, limit).map(item => {
            const artistName = Array.isArray(item.artists) ? item.artists.map(a => a.name).join(', ') : (item.author || 'Unknown Artist');
            const thumbnail = Array.isArray(item.thumbnails) && item.thumbnails.length > 0 ? item.thumbnails[0].url : (item.thumbnail || '/music_cover.png');
            
            return {
                id: item.browseId || item.playlistId || '',
                name: item.name,
                artist_name: artistName,
                image: thumbnail,
                releasedate: item.year || 'Unknown Year'
            };
        });
    } catch (err) {
        console.error('[YTMusic API Error] searchAlbums failed:', err.message);
        return [];
    }
};

module.exports = {
    searchSongs,
    searchAlbums
};
