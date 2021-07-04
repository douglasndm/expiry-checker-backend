import { checkSubscriptionOnRevenueCat } from '../Subscriptions';

interface recheckProps {
    team_id: string;
}

interface Response {
    name: string;
    subscription: RevenueCatSubscription;
}

export async function recheck({
    team_id,
}: recheckProps): Promise<Array<Response>> {
    const response = await checkSubscriptionOnRevenueCat(team_id);
    const { subscriptions } = response.subscriber;

    const allSubscription: Array<Response> = [];

    if (subscriptions.expirybusiness_monthly_default_15people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_15people',
            subscription: subscriptions.expirybusiness_monthly_default_15people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_10people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_10people',
            subscription: subscriptions.expirybusiness_monthly_default_10people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_5people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_5people',
            subscription: subscriptions.expirybusiness_monthly_default_5people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_3people) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_3people',
            subscription: subscriptions.expirybusiness_monthly_default_3people,
        });
    }
    if (subscriptions.expirybusiness_monthly_default_1person) {
        allSubscription.push({
            name: 'expirybusiness_monthly_default_1person',
            subscription: subscriptions.expirybusiness_monthly_default_1person,
        });
    }

    return allSubscription;
}
