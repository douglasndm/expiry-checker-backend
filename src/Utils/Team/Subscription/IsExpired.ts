import { getSubscriptionFromTeam } from '@utils/Team/Subscription/Get';
import { checkExpiredSubscription } from '@utils/Subscriptions/Subscription';

async function isSubscriptionExpired(team_id: string): Promise<boolean> {
    const subscription = await getSubscriptionFromTeam(team_id);

    if (!subscription) {
        return true;
    }

    return checkExpiredSubscription(subscription.expireIn);
}

export { isSubscriptionExpired };
