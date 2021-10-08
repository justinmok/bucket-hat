import { Firestore } from '@google-cloud/firestore';

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: '../gcloudauth.json'
});

export interface MudaeWishOptions {
    type: 'char' | 'series';
    name: string;
    userId: string;
    isClaimed: boolean;
}

export class MudaeWish {
    public type: 'char' | 'series';
    public name: string;
    public userId: string;
    public isClaimed: boolean;

    constructor(options: MudaeWishOptions) {
        Object.assign(this, options);
    }
}
/*

hierarchy:
COLLECTION /// DOCUMENT /// SUBCOLLECTION /// DOCUMENT /// FIELDS
root/data    mudae_wishes      guildId         userId      MudaeWish         

*/
const mudaeWishes = db.doc('data/mudae_wishes')


export const fetchWishes = (guildId: string, userId?: string): Promise<MudaeWish[]> => {
    return new Promise<MudaeWish[]>(async (resolve, reject) => {
        let collection = mudaeWishes.collection(`by_server/${guildId}/users`);
        //if (!collection) resolve([]);
        if (userId) {
            console.log('Resolving', userId)
            let document = await collection.doc(userId).collection('wishes').listDocuments();
            let wishes: MudaeWish[] = [];document.map((doc, index) => {
                doc.get().then(data => {
                    wishes.push(<MudaeWish>data.data());
                    if (index == document.length - 1) resolve(wishes);
                } );
                
            });
        } else {
            let wishes: MudaeWish[] = [];
            mudaeWishes.collection(`by_server/${guildId}/users/`)
                .listDocuments()
                .then(users =>
                    users.map(user =>
                        user.collection('wishes')
                        .get()
                        .then(wishesSnapshot => 
                            wishesSnapshot.docs.map(doc => 
                                wishes.push(<MudaeWish>doc.data()
                            )
                        )
                    )
                )
            );
            resolve(wishes);
        }
    });
} 

export const addWish = (guildId: string, wish: MudaeWish): Promise<MudaeWish> => {
    return new Promise<MudaeWish>((resolve, reject) => {
        mudaeWishes.collection(`by_server/${guildId}/users/${wish.userId}/wishes`)
            .doc(wish.name)
            .set(wish);
        resolve(wish)
    });
}