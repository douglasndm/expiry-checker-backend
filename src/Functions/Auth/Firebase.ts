import * as admin from 'firebase-admin';

import serviceAccount from '@config/Firebase/ServiceAccountKey.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
