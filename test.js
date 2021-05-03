const Firestore = require('@google-cloud/firestore');

const db = new Firestore({
    projectId: 'keylimepie',
    keyFilename: 'gcloudauth.json'
});

let map = new Map();
db.doc('config/by_server').collection('server').get().then(snapshot => {
    snapshot.forEach(server => {
        let data = server.data();
        console.log(server.id);
        console.log(data.prefix);
    });
});
