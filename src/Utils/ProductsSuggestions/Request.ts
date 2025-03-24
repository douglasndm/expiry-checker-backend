import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

import { defaultDataSource } from '@services/TypeORM';

import ProductRequest from '@models/ProductRequest';

interface Props {
	limit?: number;
}

async function getProductsRequestsByRank({
	limit,
}: Props): Promise<ProductRequest[]> {
	const requestRepository = defaultDataSource.getRepository(ProductRequest);

	const products = await requestRepository
		.createQueryBuilder('request')
		.orderBy('request.rank', 'DESC')
		.where('length(request.code) > 7')
		.limit(limit)
		.getMany();

	return products;
}

interface IUpdateProps {
	code: string;
	rank?: number;

	notFound?: boolean;
	notFoundOn?: string;
}

async function updateRequest(props: IUpdateProps): Promise<void> {
	const { code, rank, notFound, notFoundOn } = props;

	const firestore = admin.firestore(firebaseAppExpiryChecker);
	const productRef = firestore.collection('products_request').doc(code);

	await productRef.set({
		rank,
		notFound,
		notFoundOn,
	});
}

async function removeProductsFromRequest(codes: string[]): Promise<void> {
	console.log('codes to remove', codes);
	const requestRepository = defaultDataSource.getRepository(ProductRequest);

	const products = await requestRepository
		.createQueryBuilder('request')
		.where('request.code IN (:...codes)', { codes })
		.getMany();

	await requestRepository.remove(products);
}

export { getProductsRequestsByRank, updateRequest, removeProductsFromRequest };
