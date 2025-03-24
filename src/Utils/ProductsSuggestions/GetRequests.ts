import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

async function getProductsRequestsByRank(
	limit: number = 100
): Promise<IProductRequest[]> {
	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request');

	const response = await productRef
		.orderBy('rank', 'desc')
		.limit(limit)
		.get();

	return response.docs.map(doc => doc.data() as IProductRequest);
}

export { getProductsRequestsByRank };
