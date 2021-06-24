import { getRepository } from 'typeorm';

import User from '@models/User';

import { removeUserFromAllTeams } from '@utils/Users/Teams';

import AppError from '@errors/AppError';

export async function getUser(user_id: string): Promise<User | null> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({
        where: {
            firebaseUid: user_id,
        },
    });

    if (!user) {
        return null;
    }
    return user;
}

interface createUserProps {
    firebaseUid: string;
    email: string;
}

export async function createUser({
    firebaseUid,
    email,
}: createUserProps): Promise<User> {
    const userRepository = getRepository(User);

    const user = new User();
    user.firebaseUid = firebaseUid;
    user.email = email;

    const savedUser = await userRepository.save(user);

    return savedUser;
}

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
        throw new AppError({
            message: 'User not found',
            statusCode: 400,
            internalErrorCode: 7,
        });
    }

    await userRepository.remove(user);
}
// #endregion
