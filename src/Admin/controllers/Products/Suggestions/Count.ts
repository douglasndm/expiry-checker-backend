import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';
import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

import ProductDetails from '@models/ProductDetails';

class CountController {
	async index(req: Request, res: Response): Promise<Response> {
		const productsCollection = firestore(
			firebaseAppExpiryChecker
		).collection('/products');
		const count = await productsCollection.count().get();
		const firestoreCount = count.data().count;

		const repository = defaultDataSource.getRepository(ProductDetails);
		const postgresCount = await repository.count();

		return res.json({ firestore: firestoreCount, postgres: postgresCount });
	}
}

export default new CountController();
