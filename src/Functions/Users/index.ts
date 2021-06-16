import { getRepository } from 'typeorm';

import User from '@models/User';

import { removeUserFromAllTeams } from '@utils/Users/Teams';

import AppError from '@errors/AppError';

// #region
interface updateUserProps {
    firebaseUid: string;
    name?: string;
    lastName?: string;
    email?: string;
}

export async function updateUser({
    firebaseUid,
    name,
    lastName,
}: updateUserProps): Promise<User> {
    try {
        const userRepository = getRepository(User);

        const user = await userRepository.findOne({
            where: {
                firebaseUid,
            },
        });

        if (!user) {
            throw new AppError('User not found', 400);
        }

        user.name = name || null;
        user.lastName = lastName || null;

        const updatedUser = await userRepository.save(user);

        return updatedUser;
    } catch (err) {
        throw new AppError(err.message, 400);
    }
}
// #endregion

// #region
interface deleteUserProps {
    user_id: string;
}
export async function deleteUser({ user_id }: deleteUserProps): Promise<void> {
    try {
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
    } catch (err) {
        throw new AppError(err.message, 400);
    }
}
// #endregion
