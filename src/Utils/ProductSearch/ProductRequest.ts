import Sentry from '@sentry/node';
import { formatInTimeZone } from 'date-fns-tz';

import { getFromCache } from '@services/Cache/Redis';

import { getProductsRequestsByRank } from '@utils/ProductsSuggestions/GetRequests';

import { findProductByEAN } from './Find';

async function callRemainingDailyAPICalls(): Promise<void> {
	const checkInId = Sentry.captureCheckIn({
		monitorSlug: 'call-remaining-daily-api-calls',
		status: 'in_progress',
	});

	const blockRequest = await getFromCache<boolean>('external_api_request');

	if (blockRequest !== true) {
		const requests = await getProductsRequestsByRank(100);

		requests.forEach(async request => {
			await findProductByEAN({ code: request.code });
		});
	}
	const formatedDate = formatInTimeZone(
		new Date(),
		'America/Sao_Paulo',
		'dd-MM-yyyy HH:mm:ss zzzz'
	);
	console.log(
		'Tried to request remaing API request but it is already blocked for external api request'
	);
	console.log(formatedDate);

	Sentry.captureCheckIn({
		checkInId,
		monitorSlug: 'call-remaining-daily-api-calls',
		status: 'ok',
	});
}

export { callRemainingDailyAPICalls };
