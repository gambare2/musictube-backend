const lastfmProvider = require('./lastfmProvider');
const musicbrainzProvider = require('./musicbrainzProvider');
const ytmusicProvider = require('./ytmusicProvider');

module.exports = {
    // Last.fm
    searchArtists: lastfmProvider.searchArtists,
    getArtistInfo: lastfmProvider.getArtistInfo,
    getSimilarArtists: lastfmProvider.getSimilarArtists,
    getTagTopTracks: lastfmProvider.getTagTopTracks,
    getTagTopArtists: lastfmProvider.getTagTopArtists,
    getTrendingArtists: lastfmProvider.getTrendingArtists,

    // MusicBrainz
    getArtistAlbums: musicbrainzProvider.getArtistAlbums,

    // YTMusic
    searchSongs: ytmusicProvider.searchSongs,
    searchAlbums: ytmusicProvider.searchAlbums
};
