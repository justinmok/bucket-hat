import { getTracks, Track } from 'spotify-url-info';
export const retrieveSongs = (query: string): Promise<Track[]> => {
    return new Promise<Track[]>(async (resolve, reject) => {
        getTracks(query).then(tracks => resolve(tracks)).catch(e=> reject(e))
    });
}