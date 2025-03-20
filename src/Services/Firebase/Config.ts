import * as admin from 'firebase-admin';

import accountCredentials from '@config/Firebase/ServiceAccountKey.json';
import expiryAccountCredentials from '@config/Firebase/ExpiryCheckerServiceAccountKey.json';

const serviceAccount = accountCredentials as admin.ServiceAccount;
const expiryServiceAccount = expiryAccountCredentials as admin.ServiceAccount;

const firebaseApp = admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
});
firebaseApp.firestore().settings({ ignoreUndefinedProperties: true });

const firebaseAppExpiryChecker = admin.initializeApp(
	{
		credential: admin.credential.cert(expiryServiceAccount),
	},
	'expiry_checker'
);
firebaseAppExpiryChecker
	.firestore()
	.settings({ ignoreUndefinedProperties: true });

async function generateDevToken(uid: string): Promise<string> {
	const additionalClaims = {
		email: process.env.FIREBASE_DEV_EMAIL,
	};

	const customToken = await admin
		.auth()
		.createCustomToken(uid, additionalClaims);
	return customToken;
}

export { firebaseApp, firebaseAppExpiryChecker, generateDevToken };
