import { getRepository } from 'typeorm';

import { Category } from '../../../App/Models/Category';
import { Product } from '../../../App/Models/Product';
import ProductCategory from '../../../App/Models/ProductCategory';

interface addProductToCategoryProps {
    category: Category;
    product_id: string;
}

export async function addProductToCategory({
    category,
    product_id,
}: addProductToCategoryProps): Promise<ProductCategory> {
    const repository = getRepository(ProductCategory);

    const productRepository = getRepository(Product);

    const product = await productRepository.findOne({
        where: { id: product_id },
    });

    if (!product || !category) {
        throw new Error('Category or Product was not found');
    }

    const alreadyExists = await repository.findOne({
        where: {
            category,
            product: {
                id: product_id,
            },
        },
    });

    if (alreadyExists) {
        throw new Error('Product is already in category');
    }

    const productCategory = new ProductCategory();
    productCategory.category = category;
    productCategory.product = product;

    const savedProductCategory = await repository.save(productCategory);

    return savedProductCategory;
}
