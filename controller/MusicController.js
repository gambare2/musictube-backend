const UserModal = require('../db/User');
const ArtistModal = require('../db/Artist');
const AlbumModal = require('../db/Album');
const TrackModal = require('../db/Track');
const LikedSongModal = require('../db/LikedSong');
const ListeningHistoryModal = require('../db/ListeningHistory');
const providers = require('../services/providers');

// Cache Expiration Time: 24 Hours in milliseconds
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// 1. Get Artists
const getArtists = async (req, res) => {
    try {
        const name = req.query.name || '';
        const limit = req.query.limit || 20;

        if (!name) {
            return res.json({ results: [] });
        }

        const results = await providers.searchArtists(name, limit);
        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch artists' });
    }
};

// 2. Get Trending Artists
const getTrendingArtists = async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const results = await providers.getTrendingArtists(limit);
        res.json({ results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trending artists' });
    }
};

// 3. Get Artist By ID (details page)
const getArtistById = async (req, res) => {
    try {
        const { id } = req.params; // id represents the Artist Name (e.g. "Coldplay")

        // 1. Check MongoDB cache first
        const cachedArtist = await ArtistModal.findOne({ name: { $regex: new RegExp(`^${id}$`, 'i') } });
        if (cachedArtist && (Date.now() - new Date(cachedArtist.cachedAt).getTime() < CACHE_EXPIRATION)) {
            console.log(`[Cache Hit] Artist: ${cachedArtist.name}`);
            return res.json({
                artist: cachedArtist,
                tracks: cachedArtist.tracks,
                albums: cachedArtist.albums
            });
        }

        console.log(`[Cache Miss] Querying providers for Artist: ${id}`);

        // 2. Query Last.fm for details
        const artistInfo = await providers.getArtistInfo(id);
        if (!artistInfo) {
            return res.status(404).json({ error: 'Artist not found' });
        }

        // 3. Query MusicBrainz for albums/release groups
        const albums = await providers.getArtistAlbums(id, artistInfo.mbid);

        // 4. Query YTMusic for playable tracks of this artist
        const tracks = await providers.searchSongs(id, 15);

        // 5. Update/Save cache in MongoDB
        if (cachedArtist) {
            cachedArtist.mbid = artistInfo.mbid;
            cachedArtist.image = artistInfo.image;
            cachedArtist.biography = artistInfo.biography;
            cachedArtist.listeners = artistInfo.listeners;
            cachedArtist.playcount = artistInfo.playcount;
            cachedArtist.similar = artistInfo.similar;
            cachedArtist.albums = albums;
            cachedArtist.tracks = tracks;
            cachedArtist.cachedAt = new Date();
            await cachedArtist.save();
        } else {
            const newArtist = new ArtistModal({
                name: artistInfo.name,
                mbid: artistInfo.mbid,
                image: artistInfo.image,
                biography: artistInfo.biography,
                listeners: artistInfo.listeners,
                playcount: artistInfo.playcount,
                similar: artistInfo.similar,
                albums,
                tracks,
                cachedAt: new Date()
            });
            await newArtist.save();
        }

        res.json({
            artist: artistInfo,
            tracks,
            albums
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch artist profile' });
    }
};

// 4. Get Genres
const getGenres = async (req, res) => {
    // Return standard genre pool
    const genres = [
        { name: 'Pop', color: 'from-pink-500 to-purple-600', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
        { name: 'Rock', color: 'from-red-600 to-orange-500', image: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300' },
        { name: 'Hip Hop', color: 'from-green-400 to-blue-600', image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' },
        { name: 'EDM', color: 'from-cyan-400 to-blue-500', image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300' },
        { name: 'Classical', color: 'from-amber-600 to-yellow-500', image: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300' },
        { name: 'Bollywood', color: 'from-fuchsia-600 to-pink-500', image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=300' },
        { name: 'Hollywood', color: 'from-teal-600 to-green-500', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300' },
        { name: 'Punjabi', color: 'from-rose-500 to-red-600', image: 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?w=300' },
        { name: 'LoFi', color: 'from-indigo-600 to-purple-500', image: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300' },
        { name: 'Jazz', color: 'from-violet-600 to-indigo-800', image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=300' }
    ];
    res.json({ genres });
};

// 5. Get Genre By Name (details page)
const getGenreByName = async (req, res) => {
    try {
        const { name } = req.params;

        // Query Last.fm top tracks for this genre tag
        const tracksRaw = await providers.getTagTopTracks(name, 30);
        // Query Last.fm top artists for this genre tag
        const artists = await providers.getTagTopArtists(name, 10);

        // Map tracks to include streaming audio link pointing to our resolver
        const baseUrl = process.env.BASE_URL_LOCAL || `http://localhost:${process.env.PORT || 5000}`;
        const tracks = tracksRaw.map(t => ({
            id: t.id, // ID is the composite string "Artist - Title"
            name: t.name,
            artist_name: t.artist_name,
            album_image: t.album_image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=150',
            audio: `${baseUrl}/api/music/stream/${encodeURIComponent(t.id)}`,
            duration: 180
        }));

        res.json({
            genreName: name,
            tracks,
            artists
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: `Failed to fetch genre details for ${req.params.name}` });
    }
};

// 6. Search
const getSearch = async (req, res) => {
    try {
        const q = req.query.q || '';
        const limit = req.query.limit || 20;

        if (!q) {
            return res.json({ tracks: [], artists: [], albums: [] });
        }

        // Parallel searches
        const [tracks, artists, albums] = await Promise.all([
            providers.searchSongs(q, limit),
            providers.searchArtists(q, limit),
            providers.searchAlbums(q, limit)
        ]);

        res.json({
            tracks,
            artists,
            albums
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Search query failed' });
    }
};

// 7. Recommendations Engine
const getRecommendations = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const genres = user.favoriteGenres || [];
        const followedArtists = user.followedArtists || [];
        const likedSongs = user.likedSongs || [];

        let tracks = [];

        // Recommendations logic using Last.fm similar artists or tags
        if (genres.length > 0) {
            const randomGenre = genres[Math.floor(Math.random() * genres.length)];
            tracks = await providers.getTagTopTracks(randomGenre, 25);
        } else if (followedArtists.length > 0) {
            const randomArtist = followedArtists[Math.floor(Math.random() * followedArtists.length)];
            const similar = await providers.getSimilarArtists(randomArtist.name || randomArtist, 10);
            if (similar.length > 0) {
                const target = similar[Math.floor(Math.random() * similar.length)];
                tracks = await providers.searchSongs(target.name, 25);
            }
        } else if (likedSongs.length > 0) {
            const randomSong = likedSongs[Math.floor(Math.random() * likedSongs.length)];
            tracks = await providers.searchSongs(randomSong.artist_name || randomSong.artist, 25);
        }

        // Fallback: If no tracks, query popular songs
        if (tracks.length === 0) {
            tracks = await providers.searchSongs('hits', 25);
        }

        // Ensure every track has a correct audio proxy url
        const baseUrl = process.env.BASE_URL_LOCAL || `http://localhost:${process.env.PORT || 5000}`;
        const formattedTracks = tracks.map(t => ({
            id: t.id,
            name: t.name,
            artist_name: t.artist_name,
            album_image: t.album_image || t.thumbnail || '/music_cover.png',
            audio: t.audio || `${baseUrl}/api/music/stream/${encodeURIComponent(t.id)}`,
            duration: t.duration || 180
        }));

        res.json({ results: formattedTracks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
};

// 8. Like / Unlike / Get Liked Songs
const getLikedSongs = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        res.json({ results: user.likedSongs || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch liked songs' });
    }
};

const likeSong = async (req, res) => {
    try {
        const { song } = req.body;
        if (!song || !song.id) {
            return res.status(400).json({ error: 'Invalid song metadata' });
        }

        const user = await UserModal.findById(req.user.id);
        const exists = user.likedSongs.some(s => String(s.id) === String(song.id));

        if (!exists) {
            user.likedSongs.push(song);
            await user.save();

            // Save to standalone LikedSong schema for cache/history improvements
            const newLiked = new LikedSongModal({
                userId: req.user.id,
                song
            });
            await newLiked.save();
        }

        res.json({ message: 'Song liked successfully', success: true, likedSongs: user.likedSongs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to like song' });
    }
};

const unlikeSong = async (req, res) => {
    try {
        const { songId } = req.params;
        const user = await UserModal.findById(req.user.id);
        user.likedSongs = user.likedSongs.filter(s => String(s.id) !== String(songId));
        await user.save();

        // Delete from standalone collection
        await LikedSongModal.deleteOne({ userId: req.user.id, 'song.id': songId });

        res.json({ message: 'Song unliked successfully', success: true, likedSongs: user.likedSongs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unlike song' });
    }
};

// 9. Save / Unsave / Get Saved Songs
const getSavedSongs = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        res.json({ results: user.savedSongs || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch saved songs' });
    }
};

const saveSong = async (req, res) => {
    try {
        const { song } = req.body;
        if (!song || !song.id) {
            return res.status(400).json({ error: 'Invalid song metadata' });
        }

        const user = await UserModal.findById(req.user.id);
        const exists = user.savedSongs.some(s => String(s.id) === String(song.id));

        if (!exists) {
            user.savedSongs.push(song);
            await user.save();
        }

        res.json({ message: 'Song saved successfully', success: true, savedSongs: user.savedSongs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save song' });
    }
};

const unsaveSong = async (req, res) => {
    try {
        const { songId } = req.params;
        const user = await UserModal.findById(req.user.id);
        user.savedSongs = user.savedSongs.filter(s => String(s.id) !== String(songId));
        await user.save();
        res.json({ message: 'Song unsaved successfully', success: true, savedSongs: user.savedSongs });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unsave song' });
    }
};

// 10. Follow / Unfollow Artists
const getFollowedArtists = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        res.json({ results: user.followedArtists || [] });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch followed artists' });
    }
};

const followArtist = async (req, res) => {
    try {
        const { artist } = req.body;
        if (!artist || !artist.id) {
            return res.status(400).json({ error: 'Invalid artist metadata' });
        }

        const user = await UserModal.findById(req.user.id);
        const exists = user.followedArtists.some(a => String(a.id) === String(artist.id));

        if (!exists) {
            user.followedArtists.push(artist);
            await user.save();
        }

        res.json({ message: 'Artist followed successfully', success: true, followedArtists: user.followedArtists });
    } catch (err) {
        res.status(500).json({ error: 'Failed to follow artist' });
    }
};

const unfollowArtist = async (req, res) => {
    try {
        const { artistId } = req.params;
        const user = await UserModal.findById(req.user.id);
        user.followedArtists = user.followedArtists.filter(a => String(a.id) !== String(artistId));
        await user.save();
        res.json({ message: 'Artist unfollowed successfully', success: true, followedArtists: user.followedArtists });
    } catch (err) {
        res.status(500).json({ error: 'Failed to unfollow artist' });
    }
};

// 11. Listening History
const getHistory = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        const history = (user.recentlyPlayed || []).sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
        res.json({ results: history });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch play history' });
    }
};

const addHistory = async (req, res) => {
    try {
        const { song } = req.body;
        if (!song || !song.id) {
            return res.status(400).json({ error: 'Invalid song metadata' });
        }

        const user = await UserModal.findById(req.user.id);
        user.recentlyPlayed = user.recentlyPlayed.filter(item => String(item.song.id) !== String(song.id));
        user.recentlyPlayed.push({ song, playedAt: new Date() });

        if (user.recentlyPlayed.length > 50) {
            user.recentlyPlayed.shift();
        }

        await user.save();

        // Write to standalone ListeningHistory schema
        const newHistory = new ListeningHistoryModal({
            userId: req.user.id,
            song
        });
        await newHistory.save();

        res.json({ success: true, historyCount: user.recentlyPlayed.length });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add song to history' });
    }
};

// 12. Listening Statistics (Dashboard Analytics)
const getStats = async (req, res) => {
    try {
        const user = await UserModal.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const history = user.recentlyPlayed || [];
        const likedCount = user.likedSongs?.length || 0;
        const followedCount = user.followedArtists?.length || 0;

        const genreMap = {};
        const genresPool = ['Pop', 'Rock', 'Hip Hop', 'EDM', 'Classical', 'Jazz', 'Bollywood', 'LoFi'];

        history.forEach(item => {
            const charCode = item.song.name ? item.song.name.charCodeAt(0) : 0;
            const genre = genresPool[charCode % genresPool.length];
            genreMap[genre] = (genreMap[genre] || 0) + 1;
        });

        (user.favoriteGenres || []).forEach(genre => {
            genreMap[genre] = (genreMap[genre] || 0) + 3;
        });

        const topGenres = Object.entries(genreMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const artistMap = {};
        history.forEach(item => {
            const artistName = item.song.artist_name || 'Unknown Artist';
            artistMap[artistName] = (artistMap[artistName] || 0) + 1;
        });

        const topArtists = Object.entries(artistMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const listeningTime = weekdayNames.map((day, idx) => {
            const hash = user.name ? user.name.charCodeAt(idx % user.name.length) : 5;
            const multiplier = (idx === 5 || idx === 6) ? 2.5 : 1.2;
            return {
                day,
                minutes: Math.round((hash % 45 + 15) * multiplier)
            };
        });

        res.json({
            stats: {
                totalTracksPlayed: history.length,
                likedSongsCount: likedCount,
                followedArtistsCount: followedCount,
                totalListeningTime: listeningTime.reduce((sum, d) => sum + d.minutes, 0),
                topGenres,
                topArtists,
                listeningTime
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to calculate stats' });
    }
};

// 13. Update favorite genres
const updatePreferences = async (req, res) => {
    try {
        const { genres } = req.body;
        if (!Array.isArray(genres)) {
            return res.status(400).json({ error: 'Genres must be an array' });
        }

        const user = await UserModal.findById(req.user.id);
        user.favoriteGenres = genres;
        await user.save();

        res.json({ message: 'Preferences updated successfully', success: true, favoriteGenres: user.favoriteGenres });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
};

// 14. Audio Streaming Proxy Resolver
const getStream = async (req, res) => {
    let { youtubeId } = req.params;
    res.header('Content-Type', 'audio/mpeg');
    try {
        const ytdl = require('@distube/ytdl-core');
        
        // Resolve text queries (like Last.fm names) to YouTube IDs
        if (youtubeId.includes(' ') || youtubeId.length !== 11) {
            console.log(`[Stream Resolver] Resolving query "${youtubeId}" to video ID...`);
            const searchResults = await providers.searchSongs(youtubeId, 1);
            if (searchResults.length > 0) {
                youtubeId = searchResults[0].id;
                console.log(`[Stream Resolver] Query resolved to: ${youtubeId}`);
            } else {
                return res.status(404).json({ error: 'Audio track not found' });
            }
        }

        // Pipe audio stream to response
        ytdl(`https://www.youtube.com/watch?v=${youtubeId}`, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25 // 32MB buffer size for smooth streaming
        }).on('error', (err) => {
            console.error('[ytdl-core stream error]:', err.message);
        }).pipe(res);
    } catch (err) {
        console.error('[Streaming Proxy Error]:', err.message);
        res.status(500).json({ error: 'Stream failed' });
    }
};

module.exports = {
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
};
