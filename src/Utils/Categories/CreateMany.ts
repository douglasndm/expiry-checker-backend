import { defaultDataSource } from '@project/ormconfig';

import { invalidadeCache } from '@services/Cache/Redis';

import Category from '@models/Category';
import ProductCategory from '@models/ProductCategory';

import { getAllCategoriesFromTeam } from '@utils/Categories/List';
import { getTeamById } from '@utils/Team/Find';

interface createManyCategoriesProps {
    categories_names: Array<string>;
    team_id: string;
}

async function createManyCategories(
    props: createManyCategoriesProps,
): Promise<Category[]> {
    const { categories_names, team_id } = props;

    const categoriesFromTeam = await getAllCategoriesFromTeam({ team_id });
    const categoriesToCreate = categories_names.filter(cate => {
        const exists = categoriesFromTeam.find(
            b => b.name.toLowerCase() === cate.toLowerCase(),
        );

        if (exists) {
            return false;
        }

        return true;
    });

    const team = await getTeamById(team_id);

    const categories = categoriesToCreate.map(cName => {
        const category = new Category();
        category.name = cName;
        category.team = team;

        return category;
    });

    const repository = defaultDataSource.getRepository(Category);
    const createdCategories = await repository.save(categories);

    await invalidadeCache(`team_categories:${team_id}`);

    return createdCategories;
}

async function createManyProductCategories(
    prodCategories: ProductCategory[],
): Promise<ProductCategory[]> {
    const repository = defaultDataSource.getRepository(ProductCategory);
    const createdCategories = await repository.save(prodCategories);

    return createdCategories;
}

export { createManyCategories, createManyProductCategories };
