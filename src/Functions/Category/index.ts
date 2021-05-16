import { getRepository } from 'typeorm';

import { Category } from '../../App/Models/Category';
import { Team } from '../../App/Models/Team';

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
        throw new Error('Category already exists on team');
    }

    const teamRepository = getRepository(Team);
    const team = await teamRepository.findOne({
        where: {
            id: team_id,
        },
    });

    if (!team) {
        throw new Error('Team was not found');
    }

    const category = new Category();
    category.name = name;
    category.team = team;

    const savedCategory = await categoryRepository.save(category);

    return savedCategory;
}
