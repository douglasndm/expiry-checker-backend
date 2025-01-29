import { createUser } from '@utils/User/Create';
import { addUserToTeam } from '@utils/Team/Roles/Create';
import { removeUser, updateRole } from '@utils/Team/Roles/User';

import User from '@models/User';
import Team from '@models/Team';

import AppError from '@errors/AppError';

import connection from '../../../Services/Database';
import { setup } from '../../../setup';

describe('Update user roles process', () => {
	let user: User | null = null;
	let team: Team | null = null;
	beforeAll(async () => {
		await connection.create();

		const init = await setup(5);

		user = init.user;
		team = init.team;
	});

	afterAll(async () => {
		await connection.close();
	});

	beforeEach(async () => {
		await connection.clear();
	});

	it('It should change user role to supervisor', async () => {
		if (!team || !user) return;

		const secondUser = await createUser({
			firebaseUid: 'user2',
			name: 'User',
			lastName: 'Two',
			email: 'two@user.com',
			password: '123456',
		});

		await addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		});

		try {
			const updatedRole = await updateRole({
				role: 'supervisor',
				user_id: secondUser.id,
				team_id: team.id,
			});

			expect(updatedRole.role.toLowerCase()).toBe('supervisor');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
		}
	});

	it('It should change user role to repositor', async () => {
		if (!team || !user) return;

		const secondUser = await createUser({
			firebaseUid: 'user3',
			name: 'User',
			lastName: 'Three',
			email: 'three@user.com',
			password: '123456',
		});

		await addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		});

		try {
			await updateRole({
				role: 'supervisor',
				user_id: secondUser.id,
				team_id: team.id,
			});

			const updatedRole = await updateRole({
				role: 'repositor',
				user_id: secondUser.id,
				team_id: team.id,
			});

			expect(updatedRole.role.toLowerCase()).toBe('repositor');
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
		}
	});

	it('It should not change to an invalid role', async () => {
		if (!team || !user) return;

		const secondUser = await createUser({
			firebaseUid: 'user4',
			name: 'User',
			lastName: 'Four',
			email: 'four@user.com',
			password: '123456',
		});

		await addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		});

		try {
			await updateRole({
				role: 'gerente',
				user_id: secondUser.id,
				team_id: team.id,
			});
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);
			if (err instanceof AppError) {
				expect(err.errorCode).toBe(21);
			}
		}
	});

	it('should remove the user from team', async () => {
		if (!team || !user) return;

		const secondUser = await createUser({
			firebaseUid: 'user5',
			name: 'User',
			lastName: 'Five',
			email: 'five@user.com',
			password: '123456',
		});

		await addUserToTeam({
			user_id: secondUser.id,
			team_id: team.id,
		});

		expect(() => {
			if (team)
				removeUser({
					user_id: secondUser.id,
					team_id: team.id,
				});
		}).not.toThrow(AppError);
	});

	it('should not remove the manager from team', async () => {
		if (!user || !team) return;

		try {
			await removeUser({
				user_id: user.id,
				team_id: team.id,
			});

			// Fail test if above expression doesn't throw anything.
			expect(true).toBe(false);
		} catch (err) {
			expect(err).toBeInstanceOf(AppError);

			if (err instanceof AppError) {
				expect(err.statusCode).toBe(401);
				expect(err.errorCode).toBe(41);
			}
		}
	});
});
