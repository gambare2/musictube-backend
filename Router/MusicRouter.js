const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyjwt');
const {
    getArtists,
    getTrendingArtists,
    getArtistById,
    getGenres,
    getGenreByName,
    getSearch,
    getRecommendations,
    getLikedSongs,
    likeSong,
    unlikeSong,
    getSavedSongs,
    saveSong,
    unsaveSong,
    getFollowedArtists,
    followArtist,
    unfollowArtist,
    getHistory,
    addHistory,
    getStats,
    updatePreferences,
    getStream
} = require('../controller/MusicController');

// Public catalog routes
router.get('/artists', getArtists);
router.get('/artists/trending', getTrendingArtists);
router.get('/artists/:id', getArtistById);
router.get('/genres', getGenres);
router.get('/genres/:name', getGenreByName);
router.get('/search', getSearch);
router.get('/stream/:youtubeId', getStream);

// Protected user-specific interaction routes
router.get('/recommendations', verifyJWT, getRecommendations);
router.put('/preferences', verifyJWT, updatePreferences);

router.get('/liked', verifyJWT, getLikedSongs);
router.post('/like', verifyJWT, likeSong);
router.delete('/like/:songId', verifyJWT, unlikeSong);

router.get('/saved', verifyJWT, getSavedSongs);
router.post('/save', verifyJWT, saveSong);
router.delete('/save/:songId', verifyJWT, unsaveSong);

router.get('/followed', verifyJWT, getFollowedArtists);
router.post('/follow', verifyJWT, followArtist);
router.delete('/follow/:artistId', verifyJWT, unfollowArtist);

router.get('/history', verifyJWT, getHistory);
router.post('/history', verifyJWT, addHistory);
router.get('/stats', verifyJWT, getStats);

module.exports = router;
