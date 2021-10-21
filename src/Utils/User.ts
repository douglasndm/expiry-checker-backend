import { getRepository } from 'typeorm';

import User from '@models/User';

import AppError from '@errors/AppError';

export async function getUserByFirebaseId(firebase_id: string): Promise<User> {
    const userReposity = getRepository(User);

    const user = await userReposity
        .createQueryBuilder('user')
        .where('user.firebase_uid = :firebase_id', { firebase_id })
        .getOne();

    if (!user) {
        throw new AppError({
            message: 'User not found',
            internalErrorCode: 7,
        });
    }

    return user;
}
