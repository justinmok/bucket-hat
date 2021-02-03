/*
convert spotify urls to song names
*/

const gaxios = require('gaxios');

/* match base 64 resource identifier */
let idRegex = new RegExp(/(:|\/)([A-Za-z0-9_-]{22})/g);

gaxios.instance.defaults = {
    baseURL: 'https://api.spotify.com',
    Authorization: '58995e6b8f304f1791b451de38b291ac'
};

const retrievePlaylists = playlistID => {
    gaxios.request({
        url: `/v1/playlists/${playlistID}`,
        method: 'GET',
        params: {
            fields: 'tracks.items(track(name,artists))'
        }
    }).then(response => {
        let tracks = response.tracks.items;
        return tracks.map(track => `${track.artists[0].name} - ${track.name}`);
    });
};

const parseQuery = query => {

    idRegex.exec(query);
    return query.match(idRegex)[1];
};