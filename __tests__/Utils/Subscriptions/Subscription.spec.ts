import { subDays } from 'date-fns';

import {
    checkExpiredSubscription,
    handleMembersLimit,
} from '@utils/Subscriptions/Subscription';

describe('Subscription expiration check', () => {
    it('Should return that subscription IS NOT expired', () => {
        const result = checkExpiredSubscription(new Date());

        expect(result).toBe(false);
    });

    it('Should return that subscription IS expired', () => {
        const expire_date = subDays(new Date(), 1);
        const result = checkExpiredSubscription(expire_date);

        expect(result).toBe(true);
    });
});

describe('Subscription limits check', () => {
    it('Should return the correct members limit for a subscription', () => {
        const subscription: IRevenueCatSubscription = {
            name: 'expirybusiness_monthly_default_1person',
            subscription: {
                expires_date: String(new Date()),
                purchase_date: String(new Date()),
                store: 'play_store',
                unsubscribe_detected_at: null,
            },
        };

        const membersLimit = handleMembersLimit(subscription);

        expect(membersLimit.members).toBe(1);
    });

    it('Should return zero for an unknow subscription', () => {
        const subscription: IRevenueCatSubscription = {
            name: 'expirybusiness_monthly_default_100people',
            subscription: {
                expires_date: String(new Date()),
                purchase_date: String(new Date()),
                store: 'play_store',
                unsubscribe_detected_at: null,
            },
        };

        const membersLimit = handleMembersLimit(subscription);

        expect(membersLimit.members).toBe(0);
    });
});
