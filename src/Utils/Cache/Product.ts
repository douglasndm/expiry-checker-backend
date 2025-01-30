import { invalidadeCache } from '@services/Cache/Redis';

import { getProductById } from '@utils/Product/Get';

async function clearProductCache(product_id: string): Promise<void> {
	const product = await getProductById({
		product_id,
		includeBrand: true,
		includeCategory: true,
		includeStore: true,
	});

	const { team } = product;

	await invalidadeCache(`team_products:${team.id}`);
	await invalidadeCache(`product:${team.id}:${product.id}`);

	if (product.brand) {
		await invalidadeCache(`brand_products:${team.id}:${product.brand.id}`);
	}

	if (product.category) {
		await invalidadeCache(
			`category_products:${team.id}:${product.category.id}`
		);
	}
	if (product.store) {
		await invalidadeCache(`store_products:${team.id}:${product.store.id}`);
	}
}

export { clearProductCache };
