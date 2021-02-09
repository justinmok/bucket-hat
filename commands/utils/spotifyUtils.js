/*
convert spotify urls to song names
*/

const gaxios = require('gaxios');
const fs = require('fs');

let config = require('../../config.json');

const { spotifyToken } = config;
/* match base 64 resource identifier */
let idRegex = new RegExp(/(track|artist|playlist|album)[?=:|/]([A-Za-z0-9_-]{22})/g);

gaxios.instance.defaults = {
    headers: {
        Authorization: spotifyToken
    }
};

const authenticate = () => {
    return new Promise(resolve => {
        gaxios.request({
            url: 'https://accounts.spotify.com/api/token',
            method: 'POST',
            params: {
                grant_type: 'client_credentials'
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: 'Basic NGNhZDEwMmI0ZWVhNGY5ZjlhNDIwMWYxMWVhOTljNTI6NTg5OTVlNmI4ZjMwNGYxNzkxYjQ1MWRlMzhiMjkxYWM='
            }
        }).then(response => {

            gaxios.instance.defaults.headers.Authorization = `Bearer ${response.data.access_token}`;
            config = { ...config, spotifyToken };
            console.log(config);
            fs.writeFileSync('./config.json', JSON.stringify(config, null, 4));
            resolve(response.data.access_token);
        }).catch(err => console.log(err));
    });
};

const getPlaylistTracks = playlistId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/playlists/${playlistId}`,
            method: 'GET',
        }).then(response => {
            let tracks = response.data.tracks.items;
            resolve(tracks.map(track => `ytsearch1: ${track.track.artists[0].name} - ${track.track.name}`));
        }).catch(err => {
            if (err.code == 401) authenticate().then(() => resolve(getPlaylistTracks(playlistId)));
            else throw err;
        });
    });

};

const getAlbumTracks = albumId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/albums/${albumId}/tracks`,
            method: 'GET',
        }).then(response => {
            let tracks = response.data.items;
            resolve(tracks.map(track => `ytsearch1: ${track.artists[0].name} - ${track.name}`));
        }).catch(err => {
            if (err.code == 401) authenticate().then(() => resolve(getAlbumTracks(albumId)));
            else throw err;
        });
    });
};

const getTrackInfo = trackId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/tracks/${trackId}`,
            method: 'GET'
        }).then(response => {
            resolve([`ytsearch1: ${response.data.artists[0].name} - ${response.data.name}`]);
        }).catch(err => {
            if (err.code == 401) authenticate().then(() => resolve(getTrackInfo(trackId)));
            else throw err;
        });
    });
};

const getArtistTracks = artistId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
            method: 'GET',
            params: { market: 'US' }
        }).then(response => {
            let tracks = response.data.tracks;
            console.log(tracks);
            resolve(tracks.map(track => `ytsearch1: ${track.artists[0].name} - ${track.name}`));
        }).catch(err => {
            if (err.code == 401) authenticate().then(() => resolve(getArtistTracks(artistId)));
            else throw err;
        });
    });
};

const parseQuery = query => {
    let queries = [];
    let match;
    // eslint-disable-next-line no-cond-assign
    while (match = idRegex.exec(query)) queries.push({ type: match[1], id: match[2] });
    console.log(query);
    console.log(queries);
    /* return array containing track, playlist, artist, or album */
    return queries;
};

const parseSpotify = async (query) => {
    return new Promise(resolve => {
        for (const filtered of parseQuery(query)) {
            console.log(filtered);
            switch (filtered.type) {
                case 'track':
                    resolve(getTrackInfo(filtered.id));
                    break;
                case 'playlist':
                    resolve(getPlaylistTracks(filtered.id));
                    break;
                case 'album':
                    resolve(getAlbumTracks(filtered.id));
                    break;
                case 'artist':
                    resolve(getArtistTracks(filtered.id));
                    break;
                default: resolve([]);
            }
        }
    });

};
module.exports = {
    parseSpotify
};