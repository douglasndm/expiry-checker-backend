import { getRepository } from 'typeorm';

import { getTeamById } from '@utils/Team/Find';

import Category from '@models/Category';

import AppError from '@errors/AppError';

interface saveManyCategoriesProps {
    categories: Array<CVCategory>;
    team_id: string;
}

export interface OldToNewCategories {
    oldId: string;
    newId: string;
    name: string;
}

export async function saveManyCategories({
    categories,
    team_id,
}: saveManyCategoriesProps): Promise<Array<OldToNewCategories>> {
    const categoryRepository = getRepository(Category);

    const team = await getTeamById(team_id);

    const categoriesFromTeam = await categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    // This search for all categories with the same name already in team
    // those categories wont be created again
    const categoriesToCreate: Array<Category> = [];

    categories.forEach(cat => {
        const categoryAlreadyExists = categoriesFromTeam.find(
            category => category.name === cat.name,
        );

        if (!categoryAlreadyExists) {
            const category = new Category();
            category.name = cat.name;
            category.team = team;

            categoriesToCreate.push(category);
        }
    });

    const savedCategories = await categoryRepository.save(categoriesToCreate);

    const responseArray: Array<OldToNewCategories> = [];

    categories.forEach(category => {
        const savedRef = savedCategories.find(
            cat => cat.name === category.name,
        );
        const alreadyInTeam = categoriesFromTeam.find(
            cat => cat.name === category.name,
        );

        if (!savedRef && !alreadyInTeam) {
            throw new AppError({
                message: 'Erro while searching for old category ref',
                statusCode: 500,
            });
        }

        let newId = '';

        if (savedRef) {
            newId = savedRef.id;
        } else if (alreadyInTeam) {
            newId = alreadyInTeam.id;
        }

        responseArray.push({
            oldId: category.id,
            newId,
            name: category.name,
        });
    });

    return responseArray;
}
