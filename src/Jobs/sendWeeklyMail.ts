import axios from 'axios';

interface weeklyMailProps {
    data: {
        notification: Omit<MailNotification, 'user_id'>;
    };
}

async function weeklyMail({ data }: weeklyMailProps): Promise<void> {
    axios.post(`${process.env.MAIL_SERVICE_URL}/send`, data.notification);
}

export default {
    key: 'SendWeeklyMail',
    handle: weeklyMail,
};
