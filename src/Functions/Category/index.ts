import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import { Category } from '@models/Category';
import { Team } from '@models/Team';

interface createCategoryProps {
    name: string;
    team_id: string;
}

export async function createCategory({
    name,
    team_id,
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

    const teamRepository = getRepository(Team);
    const team = await teamRepository.findOne({
        where: {
            id: team_id,
        },
    });

    if (!team) {
        throw new AppError({
            message: 'Team was not found',
            statusCode: 400,
            internalErrorCode: 6,
        });
    }

    const category = new Category();
    category.name = name;
    category.team = team;

    const savedCategory = await categoryRepository.save(category);

    return savedCategory;
}
