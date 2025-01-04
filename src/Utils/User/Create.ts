import bcrypt from 'bcrypt';

import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

export async function createUser({
    firebaseUid,
    name,
    lastName,
    email,
    password,
}: createUserProps): Promise<User> {
    const userRepository = defaultDataSource.getRepository(User);

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
