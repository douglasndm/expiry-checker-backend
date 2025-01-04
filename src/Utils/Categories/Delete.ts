import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import Category from '@models/Category';

import AppError from '@errors/AppError';

interface deleteCategoryProps {
    category_id: string;
}
async function deleteCategory({
    category_id,
}: deleteCategoryProps): Promise<void> {
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

    await categoryRepository.remove(category);

    await invalidadeCache(`team_categories:${category.team.id}`);
}

export { deleteCategory };
