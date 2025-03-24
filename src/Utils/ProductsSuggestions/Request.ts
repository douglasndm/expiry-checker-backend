import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

async function getProductRequest(code: string): Promise<IProductRequest> {
	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request').doc(code);

	const response = await productRef.get();

	return response.data() as IProductRequest;
}

interface IUpdateProps {
	code: string;
	rank?: number;

	notFound?: boolean;
	notFoundOn?: string;

	createdAt?: Date;
	updatedAt?: Date;
}

async function updateProductRequest(props: IUpdateProps): Promise<void> {
	const { code, rank, notFound, notFoundOn, createdAt, updatedAt } = props;

	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request').doc(code);

	await productRef.update({
		rank,
		notFound: notFound || false,
		notFoundOn: notFoundOn || null,

		createdAt,
		updatedAt,
	});
}

async function removeProductRequest(code: string): Promise<void> {
	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request').doc(code);

	await productRef.delete();
}

export { getProductRequest, updateProductRequest, removeProductRequest };
