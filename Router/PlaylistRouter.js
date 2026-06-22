const express = require('express');
const router = express.Router();
const verifyJWT = require('../middleware/verifyjwt');
const {
    getPlaylists,
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
} = require('../controller/PlaylistController');

// All playlist routes require JWT authentication
router.use(verifyJWT);

router.get('/', getPlaylists);
router.post('/', createPlaylist);
router.get('/:id', getPlaylistById);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

router.post('/:id/songs', addSongToPlaylist);
router.delete('/:id/songs/:songId', removeSongFromPlaylist);

module.exports = router;
