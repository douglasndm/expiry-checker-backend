import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Category from '@models/Category';

import { getTeam } from '@functions/Team';

import AppError from '@errors/AppError';

interface createCategoryProps {
    team_id: string;
    name: string;
}

async function createCategory({
    team_id,
    name,
}: createCategoryProps): Promise<Category> {
    const categoryRepository = getRepository(Category);
    const alreadyExists = await categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(category.name) = LOWER(:name)', { name })
        .andWhere('team_id = :team_id', { team_id })
        .getOne();

    if (alreadyExists) {
        throw new AppError({
            message: 'Category already exists on team',
            statusCode: 400,
            internalErrorCode: 13,
        });
    }

    const team = await getTeam({ team_id });

    const category = new Category();
    category.name = name;
    category.team = team;

    const savedCategory = await categoryRepository.save(category);

    const cache = new Cache();
    await cache.invalidade(`categories_from_team:${team_id}`);

    return savedCategory;
}

export { createCategory };
