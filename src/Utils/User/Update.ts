import bcrypt from 'bcrypt';

import { defaultDataSource } from '@project/ormconfig';

import User from '@models/User';

import AppError from '@errors/AppError';

export async function updateUser({
    id,
    name,
    lastName,
    email,
    password,
}: updateUserProps): Promise<User> {
    const repository = defaultDataSource.getRepository(User);

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
