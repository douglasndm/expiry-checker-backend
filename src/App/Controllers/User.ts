import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';
import * as Yup from 'yup';

import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import { getUserByFirebaseId } from '@utils/User/Find';
import { createUser } from '@utils/User/Create';
import { updateUser } from '@utils/User/Update';

import { deleteUser } from '@functions/Users';

import AppError from '@errors/AppError';

class UserController {
	async index(req: Request, res: Response): Promise<Response> {
		if (!req.userId) {
			throw new AppError({
				message: 'Provide the user id',
				statusCode: 401,
				internalErrorCode: 1,
			});
		}

		const repository = defaultDataSource.getRepository(User);

		const user = await repository
			.createQueryBuilder('user')
			.where('user.firebaseUid = :id', { id: req.userId })
			.leftJoinAndSelect('user.role', 'role')
			.leftJoinAndSelect('user.store', 'userStore')
			.leftJoinAndSelect('userStore.store', 'store')
			.leftJoinAndSelect('user.login', 'login')
			.leftJoinAndSelect('role.team', 'team')
			.leftJoinAndSelect('team.subscriptions', 'subscriptions')
			.select([
				'user',
				'role.role',
				'role.code',
				'role.status',

				'userStore',
				'store.id',
				'store.name',

				'team.id',
				'team.name',

				'subscriptions.expireIn',
				'subscriptions.membersLimit',
			])
			.getOne();

		if (!user) {
			throw new AppError({
				message: 'User not found',
				statusCode: 401,
				internalErrorCode: 7,
			});
		}

		const userRef = firestore().collection('users').doc(user.email);
		const firebaseUser = await userRef.get();

		const userData = firebaseUser.data();

		if (!userData) {
			throw new AppError({
				message: 'User not found',
				statusCode: 401,
				internalErrorCode: 7,
			});
		}

		let organizedUser = {
			id: userData.id,
			fid: userData.firebaseUid,
			email: user.email,
			name: userData.name,
			last_name: userData.lastName,
			role: user.role,
		};

		if (user.role) {
			const { subscriptions } = user.role.team;

			organizedUser = {
				...organizedUser,
				role: {
					...user.role,
					team: {
						...user.role.team,
						subscriptions:
							subscriptions && subscriptions.length > 0
								? [
										{
											...subscriptions[0],
										},
									]
								: [],
					},
				},
				store:
					user.store && user.role.role.toLowerCase() !== 'manager'
						? user.store.store
						: null,
			};
		}

		return res.status(200).json(organizedUser);
	}

	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			firebaseUid: Yup.string().required(),
			name: Yup.string(),
			lastName: Yup.string(),
			email: Yup.string().required().email(),
			password: Yup.string(),
			passwordConfirm: Yup.string().oneOf(
				[Yup.ref('password'), undefined],
				'Password confirmation does not match'
			),
		});

		try {
			await schema.validate(req.body);
		} catch (err) {
			if (err instanceof Error)
				throw new AppError({
					message: err.message,
					internalErrorCode: 1,
				});
		}

		const { firebaseUid, email, name, lastName, password } = req.body;

		let userId = firebaseUid;

		if (req.userId) {
			userId = req.userId;
		}
		if (!userId) {
			throw new AppError({
				message: 'Provider the user id',
				statusCode: 401,
			});
		}

		const repository = defaultDataSource.getRepository(User);
		const existsUser = await repository.findOne({ where: { email } });

		if (existsUser) {
			throw new AppError({
				message: 'User already exists',
				internalErrorCode: 40,
			});
		}

		const savedUser = await createUser({
			firebaseUid,
			email,
			name,
			lastName,
			password,
		});

		return res.status(201).json(savedUser);
	}

	async update(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			name: Yup.string(),
			lastName: Yup.string(),
			email: Yup.string().email(),
			password: Yup.string(),
			passwordConfirm: Yup.string().oneOf(
				[Yup.ref('password'), undefined],
				'Password confirmation does not match'
			),
		});

		try {
			await schema.validate(req.body);
		} catch (err) {
			if (err instanceof Error)
				throw new AppError({
					message: err.message,
					internalErrorCode: 1,
				});
		}

		const { name, lastName, email, password } = req.body;

		const user = await getUserByFirebaseId(req.userId || '');

		const updatedUser = await updateUser({
			id: user.id,
			name,
			lastName,
			email,
			password,
		});

		return res.status(201).json(updatedUser);
	}

	async delete(req: Request, res: Response): Promise<Response> {
		if (!req.userId) {
			throw new AppError({
				message: 'Provider the user id',
				statusCode: 401,
			});
		}

		await deleteUser({ user_id: req.userId });

		return res.status(204).send();
	}
}

export default new UserController();
