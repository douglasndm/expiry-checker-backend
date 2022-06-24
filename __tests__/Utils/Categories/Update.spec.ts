import { createCategory } from '@utils/Categories/Create';
import { updateCategory } from '@utils/Categories/Update';

import Team from '@models/Team';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';
import { setup } from '../../setup';

describe('Update of category proccess', () => {
    let team: Team | null = null;
    beforeAll(async () => {
        await connection.create();

        const init = await setup(2);

        team = init.team;
    });

    afterAll(async () => {
        await connection.close();
    });

    beforeEach(async () => {
        await connection.clear();
    });

    it('Should update category', async () => {
        if (!team) {
            return;
        }

        const cate1 = await createCategory({
            team_id: team.id,
            name: 'Food',
        });

        const updatedCategory = await updateCategory({
            category_id: cate1.id,
            name: 'Drink',
        });

        expect(updatedCategory.name).toBe('Drink');
    });

    it('Should not update and invalid category', async () => {
        if (!team) {
            return;
        }

        try {
            await updateCategory({
                category_id: '4a9eed9a-4171-47d9-9ced-233838836bf7',
                name: 'Drink',
            });

            expect(true).toBe(false);
        } catch (err) {
            expect(err).toBeInstanceOf(AppError);
            if (err instanceof AppError) {
                expect(err.statusCode).toBe(400);
                expect(err.errorCode).toBe(10);
            }
        }
    });
});
