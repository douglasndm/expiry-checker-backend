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
    const category = await categoryRepository.findOne(category_id, {
        relations: ['team'],
    });

    if (!category) {
        throw new AppError({
            message: 'Category was not found',
            statusCode: 400,
            internalErrorCode: 10,
        });
    }

    await categoryRepository.remove(category);

    const cache = new Cache();
    await cache.invalidade(`categories_from_team:${category.team.id}`);
}

export { deleteCategory };
