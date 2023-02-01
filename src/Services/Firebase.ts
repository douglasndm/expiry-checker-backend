import * as admin from 'firebase-admin';

import accountCredentials from '@config/Firebase/ServiceAccountKey.json';
import expiryAccountCredentials from '@config/Firebase/ExpiryCheckerServiceAccountKey.json';

const serviceAccount = accountCredentials as admin.ServiceAccount;
const expiryServiceAccount = expiryAccountCredentials as admin.ServiceAccount;

const firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const firebaseAppExpiryChecker = admin.initializeApp(
    {
        credential: admin.credential.cert(expiryServiceAccount),
    },
    'expiry_checker',
);

export { firebaseApp, firebaseAppExpiryChecker };
