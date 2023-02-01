import axios from 'axios';

interface sendConfirmationEmailProps {
    to: string;
    subject: string;
    name: string;
    AppName: string;
    confirmationLink: string;
}

async function sendConfirmationEmail(
    data: sendConfirmationEmailProps,
): Promise<void> {
    axios.post(`${process.env.MAIL_SERVICE_URL}/account/confirmation`, data);
}

export { sendConfirmationEmail };
