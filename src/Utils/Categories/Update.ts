import { defaultDataSource } from '@project/ormconfig';

import { invalidadeCache } from '@services/Cache/Redis';

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
    const categoryRepository = defaultDataSource.getRepository(Category);

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

    await invalidadeCache(`team_categories:${category.team.id}`);

    return updatedCategory;
}

export { updateCategory };
