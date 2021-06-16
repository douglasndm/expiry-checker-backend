import { getRepository } from 'typeorm';

import User from '@models/User';

import AppError from '@errors/AppError';

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

        if (name) user.name = name;
        if (lastName) user.lastName = lastName;

        const updatedUser = await userRepository.save(user);

        return updatedUser;
    } catch (err) {
        throw new AppError(err.message, 400);
    }
}
