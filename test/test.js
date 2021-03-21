const rewire = require('rewire');
require('chai');

const spotifyUtils = rewire('../commands/music/utils/spotifyUtils');

describe('Spotify Utilities', function() {
    describe('Playlists', function() {
        let getPlaylistTracks = spotifyUtils.__get__('getPlaylistTracks');
        it('Query one playlist', function() {
            getPlaylistTracks('6cxcXT2WESw08rYhwXLhyR').then(response => {
                response.should.be.a('array');
                response.should.have.lengthOf(13);
            });
        });
        it('Query malformed playlist', function() {
            getPlaylistTracks('a').then(response => {
                response.should.not.be.a('array');
            });
        });
    });
/*
    describe('Artists', function() {
        it('Query one artist', function() {

        });
        it('Query multiple artists', function() {

        });
        it('Query malformed artist', function() {

        });
    });

    describe('Albums', function() {
        it('Query one album', function() {

        });
        it('Query multiple albums', function() {

        });
        it('Query malformed album', function() {

        });
    });

    describe('Tracks', function() {
        it('Query one track', function() {

        });
        it('Query multiple tracks', function() {

        });
        it('Query malformed track', function() {

        });
    });
    */
});