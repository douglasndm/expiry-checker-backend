import Stripe from 'stripe';

import stripeInstance from '@services/Stripe/init';

async function getAvailableSubscriptions(): Promise<Stripe.Product[]> {
	const products = await stripeInstance.products.list();

	return products.data;
}

export { getAvailableSubscriptions };
