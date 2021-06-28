type RevenueCatSubscription = {
    expires_date: string;
    purchase_date: string;
    store: string;
    unsubscribe_detected_at: string | null;
};

interface IRevenueCatResponse {
    subscriber: {
        subscriptions: {
            expirybusiness_monthly_default_1person?: RevenueCatSubscription;
            expirybusiness_monthly_default_3people?: RevenueCatSubscription;
            expirybusiness_monthly_default_5people?: RevenueCatSubscription;
            expirybusiness_monthly_default_10people?: RevenueCatSubscription;
            expirybusiness_monthly_default_15people?: RevenueCatSubscription;
        };
    };
}
