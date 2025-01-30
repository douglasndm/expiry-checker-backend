import { addDays } from 'date-fns';

import { testDataSource } from '@services/TypeORM.test';

import TeamSubscription from '@models/TeamSubscription';

import { createTeam } from '@utils/Team/Create';
import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { getUserByEmail } from '@utils/User/Find';

import AppError from '@errors/AppError';

import connection from '../../Services/Database';

beforeAll(async () => {
	await createUser({
		firebaseUid: '123456789asd',
		name: 'Douglas',
		lastName: 'Mattos',
		email: 'mail@mail.com',
		password: '123456789',
	});
});

beforeEach(async () => {
	await connection.clear();
});

describe('Create of a team', () => {
	it('Should create a team', async () => {
		const team = await createTeam({
			name: 'Team 01',
			admin_id: '123456789asd',
		});

		expect(team.name).toBe('Team 01');
		expect(team.id).not.toBe(null);
	});

	it('Should NOT create a team with an invalid user id', async () => {
		try {
			await createTeam({
				name: 'Team 01',
				admin_id: 'ASDKPO!(@!#',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.errorCode).toBe(7);
			}
		}
	});

	it('Should NOT create a team if user is already a manager of another team', async () => {
		try {
			await createTeam({
				name: 'Team 02',
				admin_id: '123456789asd',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
			}
		}
	});

	it('Should NOT create a team if user is in a team with the same name', async () => {
		await createUser({
			firebaseUid: 'testThiago',
			name: 'Thiago',
			lastName: 'Abreu',
			email: 'thiago@mail.com',
			password: '123456789',
		});

		// #region
		// Create a user the create another team and add the first user to team
		// So them I can check if user has another team with the same name
		await createUser({
			firebaseUid: 'testAdmin',
			name: 'Amanda',
			lastName: 'Santos',
			email: 'amanda@mail.com',
			password: '123456789',
		});

		const team = await createTeam({
			name: 'Team Amanda',
			admin_id: 'testAdmin',
		});

		const teamSubRepository =
			testDataSource.getRepository(TeamSubscription);
		const teamSub = new TeamSubscription();
		teamSub.team = team;
		teamSub.membersLimit = 10;
		teamSub.expireIn = addDays(new Date(), 7);

		await teamSubRepository.save(teamSub);
		// #endregion

		const user = await getUserByEmail('thiago@mail.com');

		await addUserToTeam({
			user_id: user.id,
			team_id: team.id,
		});

		try {
			await createTeam({
				name: 'Team Amanda',
				admin_id: 'testThiago',
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(400);
				expect(err.errorCode).toBe(14);
			}
		}
	});
});
