import { defaultDataSource } from '@services/TypeORM';

import { saveProductOnFirestore } from '@utils/ProductSearch/Save';

import ProductDetails from '@models/ProductDetails';
import ProductRequest from '@models/ProductRequest';

interface Props {
	data: { response: findProductByEANExternalResponse | null; code: string };
}

async function handleAfterProductSearch({ data }: Props): Promise<void> {
	const { response, code } = data;

	const productRepository = defaultDataSource.getRepository(ProductDetails);
	const requestRepository = defaultDataSource.getRepository(ProductRequest);

	const request = await requestRepository
		.createQueryBuilder('request')
		.where('request.code = :code', { code })
		.getOne();

	// Check if product is already on request table and add 1 to rank if
	// we didn't find a response this time
	if (request) {
		if (response !== null) {
			await requestRepository.remove(request);
		} else {
			request.rank += 1;

			await requestRepository.save(request);
		}
	} else if (!response) {
		if (code.trim().length >= 8) {
			const productRequest = new ProductRequest();
			productRequest.code = code.trim();
			productRequest.rank = 1;

			await requestRepository.save(productRequest);
		}
	} else if (response) {
		await saveProductOnFirestore({
			name: response.name,
			code: response.code,
			brand: response.brand || null,
			image: response.thumbnail,
		});

		const alreadyExists = await productRepository
			.createQueryBuilder('product')
			.where('product.code = :code', { code: response.code })
			.getOne();

		if (!alreadyExists) {
			const newProduct = new ProductDetails();
			newProduct.name = response.name;
			newProduct.code = response.code;
			newProduct.brand = response.brand;
			newProduct.thumbnail = response.thumbnail;

			await productRepository.save(newProduct);
		}
	}
}

export default {
	key: 'HandleAfterProductSearch',
	handle: handleAfterProductSearch,
};
