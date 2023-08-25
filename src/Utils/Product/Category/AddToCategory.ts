import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import Cache from '@services/Cache';

import ProductCategory from '@models/ProductCategory';

import AppError from '@errors/AppError';
import { findCategoryById } from '@utils/Categories/Find';
import { findProductById } from '../Find';

interface addToCategoryProps {
    product_id: string;
    category_id: string;
}

async function addToCategory({
    product_id,
    category_id,
}: addToCategoryProps): Promise<void> {
    const schema = Yup.object().shape({
        product_id: Yup.string().required().uuid(),
        category_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate({
            product_id,
            category_id,
        });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({
                message: err.message,
            });
        }
    }

    const prodCategoryRepository = getRepository(ProductCategory);

    const product = await findProductById(product_id);
    const category = await findCategoryById(category_id);

    const alreadyExists = await prodCategoryRepository
        .createQueryBuilder('prodCat')
        .leftJoinAndSelect('prodCat.product', 'product')
        .leftJoinAndSelect('prodCat.category', 'category')
        .where('product.id = :product_id', { product_id })
        .andWhere('category.id = :category_id', { category_id })
        .getOne();

    if (alreadyExists) {
        throw new AppError({
            message: 'Product is already in category',
            statusCode: 400,
        });
    }

    const productCategory = new ProductCategory();
    productCategory.category = category;
    productCategory.product = product;

    await prodCategoryRepository.save(productCategory);

    const cache = new Cache();
    await cache.invalidadePrefix(`product:${category.team.id}:${product_id}`);
    await cache.invalidade(
        `category_products:${category.team.id}:${category_id}`,
    );
}

export { addToCategory };
