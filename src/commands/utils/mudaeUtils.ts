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
const mudaeWishes = db.doc('data/mudae_wishes');

export const fetchWishes = (guildId: string, userId?: string): Promise<MudaeWish[]> => {
    return new Promise<MudaeWish[]>(async (resolve, reject) => {
        let collection = mudaeWishes.collection(guildId);
        if (!collection) resolve([]);
        if (userId) {
            let document = await collection.doc(userId).get();
            if (document.data()) resolve(document.data()!.wishes)
            else resolve([]);
        } else {
            let wishes: MudaeWish[] = [];
            let docs = (await collection.get()).docs;
            for (const doc of docs) {
                wishes.push(...doc.data().wishes)
            }
            resolve(wishes);
        }
    });
} 

export const addWish = (guildId: string, wish: MudaeWish): Promise<MudaeWish> => {
    return new Promise<MudaeWish>((resolve, reject) => {
        let collection = mudaeWishes.collection(guildId);
        collection.doc(wish.userId).set({wishes: [wish]});
    });
}