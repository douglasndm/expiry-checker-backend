interface batch {
    team_id: string;
    store?: Store;
    code: string | null;
    productName: string;
    batch: string | null;
    exp_date: string;
    amount: number | null;
}

interface MailNotification {
    user_id: string;
    to: string;
    bcc?: string;
    subject: string;
    name: string;
    AppName: string;
    batches: batch[];
}
