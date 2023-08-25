import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Category from '@models/Category';

import AppError from '@errors/AppError';

interface deleteCategoryProps {
    category_id: string;
}
async function deleteCategory({
    category_id,
}: deleteCategoryProps): Promise<void> {
    const categoryRepository = getRepository(Category);

    const category = await categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.team', 'team')
        .where('category.id = :category_id', { category_id })
        .getOne();

    if (!category) {
        throw new AppError({
            message: 'Category was not found',
            statusCode: 400,
            internalErrorCode: 10,
        });
    }

    await categoryRepository.remove(category);

    const cache = new Cache();
    await cache.invalidade(`team_categories:${category.team.id}`);
}

export { deleteCategory };
