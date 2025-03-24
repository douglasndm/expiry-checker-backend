import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

async function getProductSuggestion(
	code: string
): Promise<IProductSuggestion | null> {
	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products').doc(code);

	const response = await productRef.get();

	if (!response.exists) {
		return null;
	}

	return response.data() as IProductSuggestion;
}

export { getProductSuggestion };
