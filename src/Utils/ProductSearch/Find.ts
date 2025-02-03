import axios from 'axios';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';
import { saveOnCache, getFromCache } from '@services/Cache/Redis';

import BackgroundJob from '@services/Background';
import { getProductImageURL } from '@services/AWS';

import { logDateTime } from '@utils/Logs/LogDateTime';

import ProductDetails from '@models/ProductDetails';

import AppError from '@errors/AppError';

import { findProductByEANExternal } from './ExternalQuery';
import { captureException } from '@services/ExceptionsHandler';

interface findProductByEANProps {
	code: string;
}

async function findProductByEAN({
	code,
}: findProductByEANProps): Promise<ProductDetails | null> {
	const schema = Yup.object().shape({
		code: Yup.string().required().min(8),
	});

	try {
		await schema.validate({ code });
	} catch (err) {
		if (err instanceof Error) {
			throw new AppError({ message: err.message });
		}
	}

	const query = code.replace(/^0+/, ''); // Remove zero on begin

	const cachedProduct = await getFromCache<ProductDetails>(
		`product_suggestion:${query}`
	);

	const thumbnail = await getProductImageURL(query);

	if (cachedProduct?.name) {
		return {
			...cachedProduct,
			thumbnail,
		};
	}

	const productRepository = defaultDataSource.getRepository(ProductDetails);
	const product = await productRepository
		.createQueryBuilder('product')
		.where('product.code = :code', { code: `${query}` })
		.select(['product.name', 'product.brand', 'product.thumbnail'])
		.getOne();

	if (!product) {
		const isBlocked = await getFromCache<boolean>('external_api_request');

		let externalProduct: null | findProductByEANExternalResponse = null;

		if (isBlocked !== true) {
			try {
				const externalSearch = await findProductByEANExternal(query);

				if (externalSearch.name) {
					externalProduct = externalSearch;
				}
			} catch (error) {
				if (axios.isAxiosError(error)) {
					logDateTime();

					// No erro 429 antigimos o limite da api, a partir daqui desabilitamos as consultas
					// até o próximo dia
					if (error.response?.status === 429) {
						console.log('Blocking for external api request');
						logDateTime();

						await saveOnCache('external_api_request', true);
					}
				} else if (error instanceof Error) {
					captureException(error);
				}
			}
		}

		await BackgroundJob.add('HandleAfterProductSearch', {
			response: externalProduct,
			code: query,
		});

		if (externalProduct) {
			const prod: ProductDetails = {
				id: 'Generating',
				name: externalProduct.name,
				code: externalProduct.code,
				brand: externalProduct.brand,
				thumbnail: null,
				lastTimeChecked: null,
				created_at: new Date(),
				updated_at: new Date(),
			};

			return prod;
		}
	}

	let photo: undefined | string;

	if (product?.thumbnail) {
		if (product.thumbnail.startsWith('http')) {
			photo = product.thumbnail;
		}
	}

	if (!photo && product) {
		photo = await getProductImageURL(query);
	}

	saveOnCache(`product_suggestion:${query}`, {
		...product,
	});

	if (!product) {
		return null;
	}

	return {
		...product,
		code: query,
		thumbnail: photo || null,
	};
}

export { findProductByEAN };
