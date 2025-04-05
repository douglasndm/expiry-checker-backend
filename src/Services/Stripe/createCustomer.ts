import Stripe from 'stripe';

import stripeInstance from '@services/Stripe/init';

import { getCustomerByEmail } from './getCustomer';

import AppError from '@errors/AppError';

interface Props {
	name: string;
	email: string;
}

async function createCustomer(Props: Props): Promise<Stripe.Customer> {
	try {
		const alreadyExists = await getCustomerByEmail(Props.email);

		if (alreadyExists) {
			throw new AppError({
				message: 'Customer already exists',
			});
		}

		const customer = await stripeInstance.customers.create({
			name: Props.name,
			email: Props.email,
		});

		return customer;
	} catch (error) {
		if (error instanceof Stripe.errors.StripeError) {
			throw new AppError({
				message: error.message,
			});
		}

		throw error;
	}
}

export { createCustomer };
