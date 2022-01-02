interface checkAndSaveTeamSubscriptionProps {
    team_id: string;
    revenuecatSubscriptions: IRevenueCatResponse;
}

interface revenueSubscriptionsProps {
    expires_date: Date;
    purchase_date: Date;
    membersLimit: 1 | 2 | 3 | 5 | 10 | 15;
}
