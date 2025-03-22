import stripeInstance from '@services/Stripe/init';
import { getCustomerById } from '@services/Stripe/getCustomer';
import { getSubscriptionPrice } from '@services/Stripe/getSubscription';
import { createSubscriptionAndPaymentLink } from '@services/Stripe/createSubscription';

import { getTeam } from '@utils/Team/Get';

import AppError from '@errors/AppError';

interface Props {
	team_id: string;
}

async function generateStripeCheckoutURL({
	team_id,
}: Props): Promise<string | null> {
	const team = await getTeam(team_id);

	if (!team.useStripe || !team.defaultStripePackage) {
		throw new AppError({
			message: 'Team does not use Stripe',
		});
	}

	let stripeCustomer = await getCustomerById(team_id);

	if (!stripeCustomer) {
		stripeCustomer = await stripeInstance.customers.create({
			name: team.name,
			preferred_locales: ['pt-BR'],
			metadata: {
				team_id: team_id,
			},
		});
	}

	const price = await getSubscriptionPrice(team.defaultStripePackage);

	if (price.length === 0) {
		throw new AppError({
			message: 'Nenhum produto encontrado com o metadado fornecido.',
		});
	}

	const subscription = await createSubscriptionAndPaymentLink({
		customerId: stripeCustomer.id,
		priceId: price[0].id,
		successUrl: `https://controledevalidades.com/teams-subscription-success/`,
		cancelUrl: `https://controledevalidades.com/teams-subscription-cancel/`,
	});

	return subscription.url;
}

export { generateStripeCheckoutURL };
