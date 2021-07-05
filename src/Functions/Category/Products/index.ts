import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import Category from '@models/Category';
import Product from '@models/Product';
import ProductCategory from '@models/ProductCategory';

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
        throw new AppError({
            message: 'Category or Product was not found',
            statusCode: 400,
        });
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
        throw new AppError({
            message: 'Product is already in category',
            statusCode: 400,
        });
    }

    const productCategory = new ProductCategory();
    productCategory.category = category;
    productCategory.product = product;

    const savedProductCategory = await repository.save(productCategory);

    return savedProductCategory;
}

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
