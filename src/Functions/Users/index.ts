import { getRepository } from 'typeorm';

import User from '@models/User';

import { removeUserFromAllTeams } from '@utils/Users/Teams';

import AppError from '@errors/AppError';

// #region
interface deleteUserProps {
    user_id: string;
}
export async function deleteUser({ user_id }: deleteUserProps): Promise<void> {
    const userRepository = getRepository(User);

    await removeUserFromAllTeams({ user_id });

    const user = await userRepository.findOne({
        where: {
            firebaseUid: user_id,
        },
    });

    if (!user) {
        throw new AppError('User not found', 400);
    }

    await userRepository.remove(user);
}
// #endregion
