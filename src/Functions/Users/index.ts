import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

import { removeUserFromAllTeams } from '@functions/Users/Teams';

import { getUserByFirebaseId } from '@utils/User/Find';
import { deleteUser as deleteU } from '@utils/User/Delete';

// #region
interface deleteUserProps {
    user_id: string;
}
export async function deleteUser({ user_id }: deleteUserProps): Promise<void> {
    const userRepository = defaultDataSource.getRepository(User);

    await removeUserFromAllTeams({ user_id });

    const user = await getUserByFirebaseId(user_id);

    await deleteU(user.id);
}
// #endregion
