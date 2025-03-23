import { firestore } from 'firebase-admin';

async function getAllUsers(): Promise<IUser[]> {
	const usersSnapshot = await firestore()
		.collection('users')
		.where('device', '!=', null)
		.get();

	const users: IUser[] = [];

	usersSnapshot.forEach(doc => {
		users.push(doc.data() as IUser);
	});

	return users;
}

export { getAllUsers };
