import { getRepository } from 'typeorm';

import Cache from '@services/Cache';

import Category from '@models/Category';

interface getAllCategoriesFromTeamProps {
    team_id: string;
}
async function getAllCategoriesFromTeam({
    team_id,
}: getAllCategoriesFromTeamProps): Promise<Category[]> {
    const cache = new Cache();
    const cached = await cache.get<Category[]>(
        `categories_from_team:${team_id}`,
    );

    if (cached) {
        return cached;
    }

    const categoryRepository = getRepository(Category);

    const categories = await categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.team', 'team')
        .where('team.id = :team_id', { team_id })
        .select(['category.id', 'category.name'])
        .getMany();

    await cache.save(`categories_from_team:${team_id}`, categories);

    return categories;
}

export { getAllCategoriesFromTeam };
