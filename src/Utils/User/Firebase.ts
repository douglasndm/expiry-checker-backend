import admin from 'firebase-admin';

import { firebaseApp } from '@services/Firebase/Config';

import isFirebaseError from '@utils/Firebase/Error';

import AppError from '@errors/AppError';

import { sendConfirmationEmail } from './ConfirmationMail';

interface createUserOnFirebaseProps {
	name: string;
	lastName: string;
	email: string;
	password: string;
}

async function createUserOnFirebase({
	name,
	lastName,
	email,
	password,
}: createUserOnFirebaseProps): Promise<admin.auth.UserRecord> {
	try {
		const firebaseUser = await admin.auth(firebaseApp).createUser({
			displayName: `${name} ${lastName}`,
			email,
			password,
		});

		const link = await admin.auth().generateEmailVerificationLink(email);

		sendConfirmationEmail({
			to: email,
			name,
			AppName: 'Controle de Validades Times',
			subject: 'Criação de conta',
			confirmationLink: link,
		});

		return firebaseUser;
	} catch (err) {
		if (err instanceof Error) {
			if (isFirebaseError(err)) {
				if (err.code.includes('auth/email-already-exists')) {
					throw new AppError({
						message: err.message,
						internalErrorCode: 42,
					});
				}
			}
			throw new AppError({
				message: err.message,
			});
		}
	}

	throw new AppError({
		message: 'Something went wrong',
		statusCode: 500,
	});
}

export { createUserOnFirebase };
