import { defaultDataSource } from '@project/ormconfig';

import { getFromCache, saveOnCache } from '@services/Cache/Redis';

import Category from '@models/Category';

interface getAllCategoriesFromTeamProps {
    team_id: string;
}
async function getAllCategoriesFromTeam({
    team_id,
}: getAllCategoriesFromTeamProps): Promise<Category[]> {
    const cached = await getFromCache<Category[]>(`team_categories:${team_id}`);

    if (cached) {
        return cached;
    }

    const categoryRepository = defaultDataSource.getRepository(Category);

    const categories = await categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.team', 'team')
        .where('team.id = :team_id', { team_id })
        .select(['category.id', 'category.name'])
        .getMany();

    await saveOnCache(`team_categories:${team_id}`, categories);

    return categories;
}

export { getAllCategoriesFromTeam };
