import Stripe from 'stripe';

import stripeInstance from '@services/Stripe/init';

async function getSubscriptionPrice(
	subscriptionName: string
): Promise<Stripe.Price[]> {
	const products = await stripeInstance.products.search({
		query: `metadata['subscription_name']:'${subscriptionName}'`,
	});

	if (products.data.length === 0) {
		throw new Error('Nenhum produto encontrado com o metadado fornecido.');
	}

	// Caso haja mais de um produto, pode-se optar por tratar cada um ou pegar o primeiro.
	const product = products.data[0];

	// Lista os preços vinculados ao produto encontrado
	const prices = await stripeInstance.prices.list({
		product: product.id,
	});

	return prices.data;
}

export { getSubscriptionPrice };
