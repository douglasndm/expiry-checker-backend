import Stripe from 'stripe';

import stripeInstance from '@services/Stripe/init';

import AppError from '@errors/AppError';

async function getCustomer(customerId: string): Promise<Stripe.Customer> {
	try {
		const customer = await stripeInstance.customers.retrieve(customerId);
		// A verificação de tipo pode ser importante se o Stripe retornar "deleted" ou outros tipos
		if (typeof customer === 'string') {
			throw new Error('Cliente não encontrado ou resposta inesperada.');
		}
		return customer;
	} catch (error) {
		if (error instanceof Stripe.errors.StripeError) {
			switch (error.type) {
				case 'StripeCardError':
					// A declined card error
					throw new Error('Cartão inválido.');
				case 'StripeRateLimitError':
					// Too many requests made to the API too quickly
					throw new Error('Limite de solicitações excedido.');
				case 'StripeInvalidRequestError':
					// Invalid parameters were supplied to Stripe's API
					//console.log(error.message);
					// if (error.code === 'resource_missing') {
					// 	throw new AppError({
					// 		message: 'O cliente informado não foi encontrado.',
					// 	});
					// } else {
					throw new AppError({
						message: error.message,
					});
					// }
					break;
				case 'StripeAPIError':
					// An error occurred internally with Stripe's API
					throw new Error('Erro interno do Stripe.');
				case 'StripeConnectionError':
					// Some kind of error occurred during the HTTPS communication
					throw new Error('Erro na comunicação HTTPS.');
				case 'StripeAuthenticationError':
					// You probably used an incorrect API key
					throw new Error('Chave de API inválida.');
				default:
					// Handle any other types of unexpected errors
					throw new AppError({
						message: error.message,
					});
			}
		}

		throw error;
	}
}

/**
 * Busca um cliente pelo email usando a API de busca do Stripe.
 * @param email Email do cliente a ser buscado
 * @returns O primeiro cliente encontrado ou null se não existir
 */
export async function getCustomerByEmail(
	email: string
): Promise<Stripe.Customer | null> {
	try {
		const customers = await stripeInstance.customers.search({
			query: `email:'${email}'`,
		});

		if (customers.data.length === 0) {
			return null;
		}

		return customers.data[0];
	} catch (error) {
		console.error('Erro ao buscar cliente por email:', error);
		throw error;
	}
}

export { getCustomer };
