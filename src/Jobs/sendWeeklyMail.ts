import { sendMail } from '@utils/Notifications/Mail/Send';

interface weeklyMailProps {
	data: {
		notification: Omit<MailNotification, 'user_id'>;
	};
}

async function weeklyMail({ data }: weeklyMailProps): Promise<void> {
	await sendMail({ data });
}

export default {
	key: 'SendWeeklyMail',
	handle: weeklyMail,
};
