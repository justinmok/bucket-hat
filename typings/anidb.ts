enum type {
    Main = "main",
    Short = "short",
    Official = "official",
    Synonym = "syn"
}

enum language {
    type,
    

}

interface Title {
    type: string,
    language: string,

}

interface AniDBResponse {
    type: String,
    episodeCount: Number,
    startDate: string,
    endDate: string,
}

export const searchTitle = (name: string): Promise<Number[]> => {
    return new Promise<Number[]>((resolve, reject) => {

    });
}

export const getTitle = (aid: Number): Promise<AniDBResponse> => {
    return new Promise<AniDBResponse>((resolve, reject) => {

    });
    
}

