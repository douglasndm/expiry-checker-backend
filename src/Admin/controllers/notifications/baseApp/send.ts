import { Request, Response } from 'express';
import Firebase from 'firebase-admin';

import { IMessage } from '@services/Firebase/Firestone';
import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

class SendController {
	async store(req: Request, res: Response): Promise<Response> {
		const { firebase_id } = req.body;

		if (!firebase_id) {
			return res.status(400).send();
		}

		const response = await Firebase.firestore(firebaseAppExpiryChecker)
			.collection('users')
			.doc(firebase_id)
			.get();

		if (!response.exists) {
			return res.status(400).send('User not found');
		}

		const message = response.data() as IMessage;

		await Firebase.messaging(firebaseAppExpiryChecker).send({
			token: message.messagingToken,
			notification: {
				title: message.notificationTitle,
				body: message.notificationString,
			},
		});

		return res.status(201).send();
	}
}

export default new SendController();
