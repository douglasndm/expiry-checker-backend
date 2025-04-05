import bcrypt from 'bcrypt';

import { defaultDataSource } from '@services/TypeORM';

import User from '@models/User';

async function createUser({
	firebaseUid,
	name,
	lastName,
	email,
	password,
}: createUserProps): Promise<User> {
	const userRepository = defaultDataSource.getRepository(User);

	const user = new User();
	user.firebaseUid = firebaseUid;
	user.name = name || null;
	user.lastName = lastName || null;
	user.email = email;

	if (password) {
		const encrypedPassword = await bcrypt.hash(password, 8);
		user.password = encrypedPassword;
	}

	const savedUser = await userRepository.save(user);

	return savedUser;
}

export { createUser };
