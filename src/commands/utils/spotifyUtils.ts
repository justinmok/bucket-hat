import { getTracks, Track } from 'spotify-url-info';
export const retrieveSongs = (query: string): Promise<Track[]> => {
    return new Promise<Track[]>(async (resolve, reject) => {
        let tracks = await getTracks(query);
        if (!tracks) return reject('Could not retreive tracks from spotify.');
        resolve(tracks);
    });
}