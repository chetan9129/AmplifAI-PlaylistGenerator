const Songs = require("../models/songs")["model"];
const generatePlaylist = require("../api/helper")["generatePlaylist"];
const SongsAPI = require("../api/songs");
const Playlist = require("../models/playlist")["model"];
const Users = require("../models/user")["model"];

const homeController = (req, res) => {
  res.status(200).json({ message: "It's server" });
};

/** Finds the artist according to keyword */
const artistController = async (req, res) => {
  try {
    const artistKeyword = req.params.artist;
    const artist_songs = await SongsAPI.getSongsByArtist(artistKeyword);
    if (artist_songs.length == 0) {
      res.status(404).json({ message: "Artist not found." });
    } else {
      res.status(200).json(artist_songs);
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving songs." });
  }
};

/** Finds the requested song */
const songController = async (req, res) => {
  try {
    const songKeyword = req.params.song;
    const songs = await SongsAPI.getSongsByName(songKeyword);
    if (songs.length == 0) {
      res.status(404).json({ message: "Song not found." });
    } else {
      res.status(200).json(songs);
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving songs." });
  }
};

/** Finds the requested album */
const albumController = async (req, res) => {
  try {
    const albumKeyword = req.body.album;

    if (albumKeyword != undefined) {
      const songs = await SongsAPI.getSongsByAlbum(albumKeyword);
      const albumName = songs[0].album_name;
      console.log(albumName);
      if (songs.length == 0) {
        res.status(404).json({ message: "Album not found." });
      } else {
        res.status(200).json(await generatePlaylist(albumName, songs));
      }
    } else {
      res.status(404).json({ message: "Keyword Required" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving songs." });
  }
};
/** Finds the requested tag */
const tagController = async (req, res) => {
  try {
    const songKeyword = req.params.tag;

    const songs = await SongsAPI.getSongsByTag(songKeyword);
    if (songs.length == 0) {
      res.status(404).json({ message: "Tag not found." });
    } else {
      res.status(200).json(songs);
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving songs." });
  }
};

/** Finds the requested tag */
const allSongController = async (req, res) => {
  try {
    const songs = await Songs.find();

    res.status(200).json(songs);
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving songs." });
  }
};

const allPlaylistController = async (req, res) => {
  try {
    const playlists = await Playlist.find();
    res.status(200).json(playlists);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving playlists." });
  }
};

const getPlaylistById = async (req, res) => {
  const id = req.params.id;
  try {
    const playlist = await Playlist.find({ _id: id });
    res.status(200).json(playlist);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving playlists." });
  }
};
const getEmotionPlaylist = async (req, res) => {
  const emotion = req.body.emotion;

  try {
    const all_songs = await SongsAPI.getSongsByTag(emotion.toLowerCase());
    const playlists = generatePlaylist(
      emotion.charAt(0).toUpperCase() + emotion.slice(1),
      all_songs
    );
    res.status(200).json(playlists);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while retrieving playlists." });
  }
};

const getOneTapCredentials = async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,
    });

    const { name, email, picture } = ticket.getPayload();

    const user = await Users.findOne({ email: email });
    if (user === null) {
      const newUser = new Users({
        name: name,
        email: email,
        photoURL: picture,
        likedSongs: [],
      });
      newUser
        .save()
        .then(() => {
          return res.sendStatus(201);
        })
        .catch((err) => {
          if (err)
            return res.status(400).send({ message: "Username already exists" });
        });
    }

    res.status(201).json({ name, email, picture });
  } catch (err) {
    // return res.sendStatus(500).json({ message: "Internal Server Error" });
  }
};

const getPopUpCredentials = async (req, res) => {
  const { name, email, photoURL } = req.body;
  try {
    const user = await Users.findOne({ email: email });
    if (user === null) {
      const newUser = new Users({
        name: name,
        email: email,
        photoURL: photoURL,
        likedSongs: [],
      });
      await newUser.save();
    }

    res.status(201).json({ name, email, photoURL });
  } catch (err) {
    // return res.sendStatus(500).json({ message: "Internal Server Error" });
  }
};

const addToLikedSongs = async (req, res) => {
  const { song_id, email } = req.body;
  try {
    const user = await Users.find({ email: email });
    const song = await Songs.findById(song_id);
    user[0].likedSongs.push(song);
    await user[0].save();
    res.status(200).json({ message: "Pushed" });
  } catch (err) {
    console.log(err);
  }
};

const likedSongs = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.find({ email: email });
    res.status(200).json({ data: user[0].likedSongs });
  } catch (err) {
    console.log(err);
  }
};

const findSongs = async (req, res) => {
  const { keyword } = req.body;
  const result = [];
  try {
    const songsyAlbum = await SongsAPI.getSongsByAlbum(keyword);
    result.push(...songsyAlbum);
    const songsByTag = await SongsAPI.getSongsByTag(keyword);
    result.push(...songsByTag.slice(0, 6));
    const songsByArtist = await SongsAPI.getSongsByArtist(keyword);
    result.push(
      ...(songsByArtist.length < 10 ? songsByArtist : songsByArtist.slice(0, 6))
    );

    const songsByAdditionalTag = await SongsAPI.getSongsByAdditonalTag(keyword);
    result.push(
      ...(songsByAdditionalTag.length < 10
        ? songsByAdditionalTag
        : songsByAdditionalTag.slice(0, 6))
    );

    res.status(200).json({ result });
  } catch (err) {
    res.status(500).json({ messaage: "error" });
  }
};

module.exports = {
  homeController: homeController,
  songController: songController,
  artistController: artistController,
  albumController: albumController,
  tagController: tagController,
  allSongController: allSongController,
  allPlaylistController: allPlaylistController,
  getPlaylistById: getPlaylistById,
  getEmotionPlaylist: getEmotionPlaylist,
  getOneTapCredentials,
  getPopUpCredentials,
  addToLikedSongs,
  likedSongs,
  findSongs,
};
