import bcrypt from 'bcrypt';
import { firestore } from 'firebase-admin';

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

	// find if user exists on firestore
	const userDoc = await firestore().collection('users').doc(email).get();

	if (!userDoc.exists) {
		await firestore().collection('users').doc(email).set({
			id: savedUser.id,
			name,
			lastName,
			email,
			firebaseUid,

			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	return savedUser;
}

export { createUser };
