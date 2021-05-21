declare module 'spotify-url-info' {
    export function getPreview(url: string): Promise<Preview>
    export function getData(url: string): any
    export function getTracks(url: string): Promise<Track[]>

    interface Preview {
        title: string;
        type: 'track' | 'playlist' | 'episode' | 'artist' | 'album';
        track: string;
        artist: string;
        image: string;
        audio: string;
        link: string;
        embed: string;
        date: string;
        description: string;
    }

    export interface Track {
        album: Album;
        artists: Artist[];
        disc_number: number;
        duration_ms: number;
        episode: boolean;
        explicit: boolean;
        external_ids: ExternalIds;
        external_urls: ExternalUrls;
        href: string;
        id: string;
        is_local: boolean;
        is_playable: boolean;
        name: string;
        popularity: number;
        preview_url: string;
        track: boolean;
        track_number: number;
        type: 'track';
        uri: string;
    }

    export interface Album {
        album_type: string;
        artists: Artist[];
        external_urls: ExternalUrls;
        href: string;
        id: string;
        images: Image[];
        name: string;
        release_date: Date;
        release_date_precision: string;
        total_tracks: number;
        uri: string;
    }

    export interface Artist {
        external_urls: ExternalUrls;
        href: string;
        id: string;
        name: string;
        type: 'artist';
        uri: string;
    }

    export interface ExternalUrls {
        spotify: string;
    }

    export interface Image {
        height?: number;
        url: string;
        width?: number;
    }

    export interface ExternalIds {
        isrc?: string;
        ean?: string;
        upc?: string;
    }
}
