/*
convert spotify urls to song names
*/

const gaxios = require('gaxios');

/* match base 64 resource identifier */
let idRegex = new RegExp(/(track|artist|playlist|album)[?=:|/]([A-Za-z0-9_-]{22})/g);

gaxios.instance.defaults = {
    headers: {
        Authorization: 'Bearer BQCwDOtRa6gMqaLALFeN2hUoG79KWEPq9hD-34axgdY0LkYs-qxIFJFkEr-DdyVqyvlMIS__55fPkQc-TBY'
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
            if (response.status == 401) resolve(authenticate.then(() => getPlaylistTracks(playlistId)));
            else { 
                let tracks = response.data.tracks.items;
                resolve(tracks.map(track => `ytsearch1: ${track.track.artists[0].name} - ${track.track.name}`));
            }
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
        });
    });
};

const getTrackInfo = trackId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/tracks/${trackId}`,
            method: 'GET'
        }).then(response => {
            if (response.status == 401) resolve(authenticate.then(() => getTrackInfo(trackId)));
            console.log(response.data);
            resolve([`ytsearch1: ${response.data.artists[0].name} - ${response.data.name}`]);
        }).catch(err => console.log(err));
    });
};

const getArtistTracks = artistId => {
    return new Promise(resolve => {
        gaxios.request({
            url: `https://api.spotify.com/v1/artists/${artistId}/top-tracks`,
            method: 'GET'
        }).then(response => {
            if (response.status == 401) resolve(authenticate.then(() => getArtistTracks(artistId)));
            let tracks = response.tracks;
            console.log(tracks);
            resolve(tracks.map(track => `ytsearch1: ${track.artists[0].name} - ${track.name}`));
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
                default: return;
            }
        }
    });

};
module.exports = {
    parseSpotify
};