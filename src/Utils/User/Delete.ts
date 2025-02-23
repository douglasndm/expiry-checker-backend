import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

async function deleteUser(user_id: string): Promise<void> {
	const repository = defaultDataSource.getRepository(User);

	const user = await repository
		.createQueryBuilder('user')
		.where('user.id = :id', { id: user_id })
		.getOne();

	if (user) {
		await repository.remove(user);
	}
}

export { deleteUser };
