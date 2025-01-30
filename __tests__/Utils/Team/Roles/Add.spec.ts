import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { getUserByEmail } from '@utils/User/Find';

import User from '@models/User';
import Team from '@models/Team';

import AppError from '@errors/AppError';

import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Test adition of user in a team', () => {
	let user: User | null = null;
	let team: Team | null = null;
	beforeAll(async () => {
		const init = await setup(2);

		user = init.user;
		team = init.team;
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('should add an user inside the team', async () => {
		if (!team || !user) return;

		const secondUser = await createUser({
			firebaseUid: 'user2',
			name: 'User',
			lastName: 'Two',
			email: 'two@user.com',
			password: '123456',
		});

		const role = await addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		});

		expect(role.team.id).toBe(team.id);
		expect(role.user.id).toBe(secondUser.id);
		expect(role.user.name).toBe(secondUser.name);
		expect(role.code).not.toBe(null);
	});

	it('should not add a duplicade user in a team', async () => {
		if (!team || !user) return;

		const secondUser = await getUserByEmail('two@user.com');

		addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		}).catch(err => {
			expect(err).toBeInstanceOf(AppError);
			expect(err.errorCode).toBe(23);
			expect(err.statusCode).toBe(400);
		});
	});

	it('should not add an user on an invalid team', async () => {
		const thriedUser = await createUser({
			firebaseUid: 'user3',
			name: 'User',
			lastName: 'Three',
			email: 'three@user.com',
			password: '123456',
		});

		addUserToTeam({
			user_id: thriedUser.id,
			team_id: '99914b2a-80b5-4bee-8383-c090636f303f', // this is an invalid UUID for a team
		}).catch(err => {
			expect(err).toBeInstanceOf(AppError);
			expect(err.errorCode).toBe(6);
		});
	});

	it('should not add an invalid user on an team', async () => {
		if (!team) return;

		addUserToTeam({
			user_id: '33714a2a-80b5-4bee-8383-c590636f303f', // this is an invalid UUID for a user
			team_id: team.id,
		}).catch(err => {
			expect(err).toBeInstanceOf(AppError);
			expect(err.errorCode).toBe(18);
			expect(err.statusCode).toBe(400);
		});
	});

	it('should not add an user on a team with an incompatible subscription', async () => {
		if (!team) return;

		const User4 = await createUser({
			firebaseUid: 'user4',
			name: 'User',
			lastName: 'Four',
			email: 'four@user.com',
			password: '123456',
		});

		try {
			await addUserToTeam({
				user_id: User4.id,
				team_id: team.id,
			});

			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.errorCode).toBe(16);
				expect(err.statusCode).toBe(401);
			}
		}
	});
});
