import { saveProductOnFirestore } from '@utils/ProductSearch/Save';

async function createProduct(product: IProductSuggestion): Promise<void> {
	await saveProductOnFirestore({
		name: product.name.toUpperCase(),
		code: product.code,
		brand: product.brand,
		image: product.image,
		data_from: product.data_from || 'local',
		ncm: product.ncm,
		country: product.country,
	});
}

export { createProduct };
