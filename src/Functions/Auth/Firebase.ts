import * as admin from 'firebase-admin';

import firebaseAccountCredentials from '@config/Firebase/ServiceAccountKey.json';

const serviceAccount = firebaseAccountCredentials as admin.ServiceAccount;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
