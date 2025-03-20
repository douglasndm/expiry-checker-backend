import Stripe from 'stripe';

import stripeInstance from '@services/Stripe/init';

interface Props {
	customerId: string;
	priceId: string;
	successUrl: string;
	cancelUrl: string;
}

/**
 * Cria uma sessão de Checkout para assinatura e gera um link de pagamento.
 * Ao completar o pagamento, a assinatura será criada automaticamente.
 *
 * @param customerId ID do cliente que fará a assinatura
 * @param priceId ID do preço (plano) que será assinado
 * @param successUrl URL para redirecionamento em caso de sucesso
 * @param cancelUrl URL para redirecionamento em caso de cancelamento
 * @returns A sessão do Checkout com a URL para redirecionamento
 */
async function createSubscriptionAndPaymentLink(
	Props: Props
): Promise<Stripe.Checkout.Session> {
	const { customerId, priceId, successUrl, cancelUrl } = Props;
	try {
		const session = await stripeInstance.checkout.sessions.create({
			mode: 'subscription', // Indica que é para assinatura
			payment_method_types: ['card'],
			customer: customerId,
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			success_url: successUrl,
			cancel_url: cancelUrl,
		});
		return session;
	} catch (error) {
		console.error('Erro ao criar assinatura e link de pagamento:', error);
		throw error;
	}
}

export { createSubscriptionAndPaymentLink };
