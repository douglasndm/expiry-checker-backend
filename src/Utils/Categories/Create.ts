import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import Category from '@models/Category';

import AppError from '@errors/AppError';

import { getTeamById } from '@utils/Team/Find';

interface createCategoryProps {
    team_id: string;
    name: string;
}

async function createCategory({
    team_id,
    name,
}: createCategoryProps): Promise<Category> {
    const categoryRepository = defaultDataSource.getRepository(Category);
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

    const team = await getTeamById(team_id);

    const category = new Category();
    category.name = name;
    category.team = team;

    const savedCategory = await categoryRepository.save(category);

    await invalidadeCache(`team_categories:${team_id}`);

    return savedCategory;
}

export { createCategory };
