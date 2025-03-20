import { Request, Response } from 'express';
import { firestore } from 'firebase-admin';

import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

class MigrateUsersController {
	async store(req: Request, res: Response): Promise<Response> {
		const repository = defaultDataSource.getRepository(User);

		const users = await repository.createQueryBuilder('user').getMany();

		const batchSize = 500;
		let migratedCount = 0;

		const usersCollections = firestore().collection('users');

		console.log(`Migrando ${users.length} usuários...`);

		try {
			for (let i = 0; i < users.length; i += batchSize) {
				console.log(
					`Processando batch ${Math.ceil(i / batchSize) + 1}...`
				);

				const batch = firestore().batch();
				const currentBatch = users.slice(i, i + batchSize);

				currentBatch.forEach(user => {
					const userRef = usersCollections.doc(user.email);

					userRef.update({
						id: user.id,
						name: user.name,
						lastName: user.lastName,
						email: user.email,

						firebaseUid: user.firebaseUid,

						createdAt: user.created_at,
						updatedAt: user.updated_at,
					});
				});

				console.log('Commitando batch...');
				await batch.commit();
				migratedCount += currentBatch.length;

				console.log(
					`Batch concluído. Total migrado: ${migratedCount}/${users.length}`
				);

				// Intervalo para evitar throttling (opcional)
				await new Promise(resolve => setTimeout(resolve, 2000));
			}
		} catch (error) {
			console.error('Erro durante a migração:', error);
			return res.status(500).send('Migration failed');
		}

		return res.send('Migration completed');
	}
}

export default new MigrateUsersController();
