import { defaultDataSource } from '@services/TypeORM';

import Category from '@models/Category';
import AppError from '@errors/AppError';

async function findCategoryById(category_id: string): Promise<Category> {
    const categoryRepository = defaultDataSource.getRepository(Category);

    const category = await categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.team', 'team')
        .where('category.id = :category_id', { category_id })
        .getOne();

    if (!category) {
        throw new AppError({
            message: 'Category not found',
            internalErrorCode: 10,
            statusCode: 400,
        });
    }

    return category;
}

export { findCategoryById };
