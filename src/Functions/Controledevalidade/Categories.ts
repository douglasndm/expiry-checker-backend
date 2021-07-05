import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import Category from '@models/Category';
import Team from '@models/Team';

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
    const teamRepository = getRepository(Team);
    const categoryRepository = getRepository(Category);

    const team = await teamRepository.findOne(team_id);

    if (!team) {
        throw new AppError({ message: 'Team was not found', statusCode: 400 });
    }

    const categoriesFromTeam = await categoryRepository.find({
        where: {
            team,
        },
    });

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
