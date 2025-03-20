import axios from 'axios';

import { captureException } from '@services/ExceptionsHandler';

interface Props {
	data: {
		notification: Omit<MailNotification, 'user_id'>;
	};
}

async function sendMail({ data }: Props): Promise<void> {
	try {
		console.log('Sending weekly mail to: ', data.notification.to);
		axios.post(`${process.env.MAIL_SERVICE_URL}/send`, data.notification);
	} catch (err) {
		if (err instanceof Error) {
			captureException(err);
		}
	}
}

export { sendMail };
