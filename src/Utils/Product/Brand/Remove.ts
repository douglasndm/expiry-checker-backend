import { findProductById } from '../Find';
import { updateProduct } from '../Update';

async function removeBrandFromProduct(product_id: string): Promise<void> {
    const product = await findProductById(product_id);

    await updateProduct({
        id: product.id,
        brand_id: null,
    });
}

export { removeBrandFromProduct };
