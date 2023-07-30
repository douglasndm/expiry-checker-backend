import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Category from '@models/Category';

import AppError from '@errors/AppError';

interface updateCategoryProps {
    category_id: string;
    name: string;
}

async function updateCategory({
    category_id,
    name,
}: updateCategoryProps): Promise<Category> {
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

    category.name = name;

    const updatedCategory = await categoryRepository.save(category);

    const cache = new Cache();
    await cache.invalidade(`categories_from_team:${category.team.id}`);

    return updatedCategory;
}

export { updateCategory };
