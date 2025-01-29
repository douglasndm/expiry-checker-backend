import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import { invalidadeCache } from '@services/Cache/Redis';

async function cosmoAPI(query: string) {
	const api = axios.create({
		baseURL: 'https://api.cosmos.bluesoft.com.br',
		headers: {
			'X-Cosmos-Token': process.env.BLUESOFT_TOKEN,
			UserAgent: 'Cosmos-API-Request',
		},
	});

	const response = await api.get<BluesoftResponse>(`/gtins/${query}`);

	return {
		name: response.data.description,
		code: String(response.data.gtin),
		brand: response.data?.brand?.name,
		thumbnail: response.data.thumbnail,
	};
}

async function findProductByEANExternal(
	code: string
): Promise<findProductByEANExternalResponse> {
	const response = await cosmoAPI(code);

	return response;
}

async function allowExternalQuery(): Promise<void> {
	const formatedDate = formatInTimeZone(
		new Date(),
		'America/Sao_Paulo',
		'dd-MM-yyyy HH:mm:ss zzzz'
	);
	console.log('Removing block for external api request');
	console.log(formatedDate);

	await invalidadeCache('external_api_request');
}

export { findProductByEANExternal, allowExternalQuery };
