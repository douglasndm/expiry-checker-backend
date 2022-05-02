import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import Cache from '@services/Cache';

async function findProductByEANExternal(
    code: string,
): Promise<findProductByEANExternalResponse> {
    const api = axios.create({
        baseURL: 'https://api.cosmos.bluesoft.com.br',
        headers: {
            'X-Cosmos-Token': process.env.BLUESOFT_TOKEN,
            UserAgent: 'Cosmos-API-Request',
        },
    });

    const response = await api.get<BluesoftResponse>(`/gtins/${code}`);

    console.log('External API response');
    console.log(response.data);

    return {
        name: response.data.description,
        code: String(response.data.gtin),
        brand: response.data?.brand?.name,
        thumbnail: response.data.thumbnail,
    };
}

async function allowExternalQuery(): Promise<void> {
    const formatedDate = formatInTimeZone(
        new Date(),
        'America/Sao_Paulo',
        'dd-MM-yyyy HH:mm:ss zzzz',
    );
    console.log('Removing block for external api request');
    console.log(formatedDate);

    const cache = new Cache();
    await cache.invalidade('stop_external_ean_api_request');
}

export { findProductByEANExternal, allowExternalQuery };
