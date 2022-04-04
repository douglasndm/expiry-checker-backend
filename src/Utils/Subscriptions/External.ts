import axios from 'axios';

async function getExternalSubscription(
    id: string,
): Promise<IRevenueCatSubscription[]> {
    const api = axios.create({
        headers: {
            Authorization: process.env.REVENUECAT_API_KEY,
        },
    });

    const { data } = await api.get<IRevenueCatResponse>(
        `https://api.revenuecat.com/v1/subscribers/${id}`,
    );

    const subscriptions: IRevenueCatSubscription[] = [];

    // Revenue Cat return an object with name of subscription and its props
    // This transform this object in an array and put the old name of object
    // into a property name inside a array of subscriptions
    Object.entries(data.subscriber.subscriptions).forEach(([key, value]) => {
        if (value)
            subscriptions.push({
                name: key,
                subscription: value,
            });
    });

    return subscriptions;
}

export { getExternalSubscription };
