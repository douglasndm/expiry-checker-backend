import * as admin from 'firebase-admin';

import serviceAccount from '../../Config/Firebase/ServiceAccountKey.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
