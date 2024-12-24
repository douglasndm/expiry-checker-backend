import { defaultDataSource } from '@project/ormconfig';

import User from '@models/User';

import { getUserById } from './Find';

async function deleteUser(user_id: string): Promise<void> {
    const repository = defaultDataSource.getRepository(User);

    const user = await getUserById(user_id);

    await repository.remove(user);
}

export { deleteUser };
