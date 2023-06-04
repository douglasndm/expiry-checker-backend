import axios from 'axios';
import { formatInTimeZone } from 'date-fns-tz';

import Cache from '@services/Cache';

async function brasilAPI(
    query: string,
): Promise<findProductByEANExternalResponse> {
    const api = axios.create({
        baseURL: 'http://brasilapi.simplescontrole.com.br',
        params: {
            'access-token': process.env.BRASIL_API_TOKEN,
            _format: 'json',
        },
    });

    const response = await api.get<BrasilAPIResponse>(`/mercadoria/consulta/`, {
        params: {
            ean: query,
        },
    });

    if (!response.data.return) {
        throw new Error(response.data.message);
    }

    return {
        name: response.data.return.nome.trim(),
        code: response.data.return.ean.trim(),
        brand: response.data.return?.marca_nome.trim(),
    };
}

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
    code: string,
): Promise<findProductByEANExternalResponse> {
    try {
        const response = await brasilAPI(code);

        return response;
    } catch (error) {
        const response = await cosmoAPI(code);
        return response;
    }
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
