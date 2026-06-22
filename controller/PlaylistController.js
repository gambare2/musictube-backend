const PlaylistModal = require('../db/Playlist');

// 1. Get user playlists and public playlists
const getPlaylists = async (req, res) => {
    try {
        // Find playlists created by this user OR public playlists
        const playlists = await PlaylistModal.find({
            $or: [
                { creator: req.user.id },
                { isPublic: true }
            ]
        }).populate('creator', 'name email username');
        
        res.json({ results: playlists });
    } catch (err) {
        console.error('[PLAYLIST GET ERROR]', err);
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
};

// 2. Create Playlist
const createPlaylist = async (req, res) => {
    try {
        const { name, description, coverImage, isPublic } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Playlist name is required' });
        }

        const defaultCover = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300"; // default placeholder image

        const playlist = new PlaylistModal({
            name,
            description: description || '',
            coverImage: coverImage || defaultCover,
            isPublic: isPublic || false,
            creator: req.user.id,
            songs: []
        });

        await playlist.save();
        res.status(201).json({ message: 'Playlist created successfully', success: true, playlist });
    } catch (err) {
        console.error('[PLAYLIST CREATE ERROR]', err);
        res.status(500).json({ error: 'Failed to create playlist' });
    }
};

// 3. Get Playlist By ID
const getPlaylistById = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await PlaylistModal.findById(id).populate('creator', 'name email username');

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Authorize: public playlists can be viewed by anyone, private only by creator
        if (!playlist.isPublic && playlist.creator._id.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized view access' });
        }

        res.json({ playlist });
    } catch (err) {
        console.error('[PLAYLIST DETAIL ERROR]', err);
        res.status(500).json({ error: 'Failed to fetch playlist details' });
    }
};

// 4. Update Playlist
const updatePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, coverImage, isPublic, songs } = req.body;

        const playlist = await PlaylistModal.findById(id);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized write access' });
        }

        if (name !== undefined) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        if (coverImage !== undefined) playlist.coverImage = coverImage;
        if (isPublic !== undefined) playlist.isPublic = isPublic;
        if (songs !== undefined && Array.isArray(songs)) playlist.songs = songs;

        await playlist.save();
        res.json({ message: 'Playlist updated successfully', success: true, playlist });
    } catch (err) {
        console.error('[PLAYLIST UPDATE ERROR]', err);
        res.status(500).json({ error: 'Failed to update playlist' });
    }
};

// 5. Delete Playlist
const deletePlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const playlist = await PlaylistModal.findById(id);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized write access' });
        }

        await PlaylistModal.findByIdAndDelete(id);
        res.json({ message: 'Playlist deleted successfully', success: true });
    } catch (err) {
        console.error('[PLAYLIST DELETE ERROR]', err);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
};

// 6. Add Song to Playlist
const addSongToPlaylist = async (req, res) => {
    try {
        const { id } = req.params;
        const { song } = req.body; // Full song object: { id, name, artist_name, audio, album_image }

        if (!song || !song.id) {
            return res.status(400).json({ error: 'Invalid song metadata' });
        }

        const playlist = await PlaylistModal.findById(id);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized write access' });
        }

        // Prevent duplicate songs
        const exists = playlist.songs.some(s => s.id === song.id);
        if (exists) {
            return res.status(409).json({ error: 'Song already in playlist' });
        }

        playlist.songs.push(song);
        await playlist.save();

        res.json({ message: 'Song added to playlist', success: true, playlist });
    } catch (err) {
        console.error('[PLAYLIST ADD SONG ERROR]', err);
        res.status(500).json({ error: 'Failed to add song to playlist' });
    }
};

// 7. Remove Song from Playlist
const removeSongFromPlaylist = async (req, res) => {
    try {
        const { id, songId } = req.params;

        const playlist = await PlaylistModal.findById(id);
        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.creator.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized write access' });
        }

        playlist.songs = playlist.songs.filter(s => s.id !== songId);
        await playlist.save();

        res.json({ message: 'Song removed from playlist', success: true, playlist });
    } catch (err) {
        console.error('[PLAYLIST REMOVE SONG ERROR]', err);
        res.status(500).json({ error: 'Failed to remove song from playlist' });
    }
};

module.exports = {
    getPlaylists,
    createPlaylist,
    getPlaylistById,
    updatePlaylist,
    deletePlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
};
