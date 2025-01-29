import axios from 'axios';

interface weeklyMailProps {
    data: {
        notification: Omit<MailNotification, 'user_id'>;
    };
}

async function weeklyMail({ data }: weeklyMailProps): Promise<void> {
    try {
        console.log('Sending weekly mail to: ', data.notification.to);
        axios.post(`${process.env.MAIL_SERVICE_URL}/send`, data.notification);
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
    }
}

export default {
    key: 'SendWeeklyMail',
    handle: weeklyMail,
};
