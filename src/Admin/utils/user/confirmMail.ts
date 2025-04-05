import admin from 'firebase-admin';

async function confirmUserMail(email: string): Promise<void> {
	const user = await admin.auth().getUserByEmail(email);

	await admin.auth().updateUser(user.uid, { emailVerified: true });
}

export { confirmUserMail };
