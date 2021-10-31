import { getRepository } from 'typeorm';
import bcrypt from 'bcrypt';

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

export async function createUser({
    firebaseUid,
    name,
    lastName,
    email,
    password,
}: createUserProps): Promise<User> {
    const userRepository = getRepository(User);

    const user = new User();
    user.firebaseUid = firebaseUid;
    user.name = name;
    user.lastName = lastName;
    user.email = email;

    if (password) {
        const encrypedPassword = await bcrypt.hash(password, 8);
        user.password = encrypedPassword;
    }

    const savedUser = await userRepository.save(user);

    return savedUser;
}

export async function updateUser({
    id,
    name,
    lastName,
    email,
    password,
}: updateUserProps): Promise<User> {
    const repository = getRepository(User);

    const user = await repository.findOne({ where: { id } });

    if (!user) {
        throw new AppError({ message: 'User not found', internalErrorCode: 7 });
    }

    if (email) user.email = email;

    user.name = name;
    user.lastName = lastName;

    if (password) {
        const encrypedPassword = await bcrypt.hash(password, 8);
        user.password = encrypedPassword;
    }

    const updatedUser = await repository.save(user);

    return updatedUser;
}
