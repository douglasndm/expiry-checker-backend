import { getRepository } from 'typeorm';

import ProductCategory from '@models/ProductCategory';

interface removeAllCategoriesFromProductProps {
    product_id: string;
}

export async function removeAllCategoriesFromProduct({
    product_id,
}: removeAllCategoriesFromProductProps): Promise<void> {
    const productCategoryRepository = getRepository(ProductCategory);

    const categoriesFinded = await productCategoryRepository.find({
        where: {
            product: {
                id: product_id,
            },
        },
    });

    await productCategoryRepository.remove(categoriesFinded);
}
