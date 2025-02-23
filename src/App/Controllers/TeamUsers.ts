import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import { invalidadeCache } from '@services/Cache/Redis';

import AppError from '@errors/AppError';

import { getAllUsersFromTeam, UserResponse } from '@functions/Team/Users';

import UserTeam from '@models/UserTeam';

class TeamUsersController {
	async index(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const usersInTeam = await getAllUsersFromTeam({ team_id });

		const isUserInTeam = usersInTeam.find(user => user.fid === req.userId);

		if (!isUserInTeam) {
			throw new AppError({
				message: "You don't have permission to be here",
				statusCode: 401,
				internalErrorCode: 2,
			});
		}

		const usersResponse: Array<UserResponse> = [];

		if (isUserInTeam.role.toLowerCase() !== 'manager') {
			usersInTeam.forEach(user => {
				usersResponse.push({
					id: user.id,
					uuid: user.uuid,
					fid: user.fid,
					name: user.name,
					lastName: user.lastName,
					email: user.email,
					role: user.role,
					status: user.status,
					store: user.store,
				});
			});

			return res.status(200).json(usersResponse);
		}
		return res.status(200).json(usersInTeam);
	}

	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			code: Yup.string().required(),
		});

		try {
			await schema.validate(req.body);
		} catch (err) {
			throw new AppError({
				message: 'Check the code',
				internalErrorCode: 24,
			});
		}

		const { team_id } = req.params;
		const { code } = req.body;

		const userRolesRepositoy = defaultDataSource.getRepository(UserTeam);
		const roles = await userRolesRepositoy
			.createQueryBuilder('userRoles')
			.leftJoinAndSelect('userRoles.team', 'team')
			.leftJoinAndSelect('userRoles.user', 'user')
			.where('team.id = :team_id', { team_id })
			.andWhere('user.firebaseUid = :user_id', {
				user_id: req.userId,
			})
			.getOne();

		if (!roles) {
			throw new AppError({
				message: 'You was not invited to the team',
				statusCode: 401,
				internalErrorCode: 25,
			});
		}

		if (code !== roles.code) {
			throw new AppError({
				message: 'Code is not valid',
				statusCode: 401,
				internalErrorCode: 24,
			});
		}

		roles.status = 'completed';

		const teamsCollection = firestore().collection('teams');
		const teamRef = teamsCollection.doc(team_id);

		const usersCollection = firestore().collection('users');
		const userRef = usersCollection.doc(roles.user.email);
		await userRef.update({
			teamId: team_id,
		});

		const roleRef = teamRef.collection('roles').doc(roles.user.id);

		await roleRef.update({
			status: roles.status,

			updatedAt: firestore.Timestamp.fromDate(new Date()),
		});

		const updatedRole = await userRolesRepositoy.save(roles);
		await invalidadeCache(`team_users:${team_id}`);

		return res.status(200).json(updatedRole);
	}
}

export default new TeamUsersController();
