import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

interface Props {
	limit?: number;
}

async function getProductsRequestsByRank({
	limit,
}: Props): Promise<IProductRequest[]> {
	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request');

	const query = productRef.orderBy('rank', 'desc').limit(limit || 50);

	const response = await query.get();

	const docs: IProductRequest[] = response.docs.map(doc => {
		return {
			...(doc.data() as IProductRequest),
			code: doc.id,
		};
	});

	return docs;
}

export { getProductsRequestsByRank };
