import axios from 'axios';

import Cache from '@services/Cache';

interface BluesoftResponse {
    avg_price: number;
    brand: {
        name: string;
        picture: string;
    };
    description: string;
    gpc: {
        code: string;
        description: string;
    };
    gross_weight: number;
    gtin: number;
    height: number;
    length: number;
    max_price: number;
    ncm: {
        code: string;
        description: string;
        full_description: string;
    };
    net_weight: number;
    price: string;
    thumbnail: string;
    width: number;
}

interface findProductByEANExternalResponse {
    name: string;
    code: string;
    brand?: string;
    thumbnail?: string;
}

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

    return {
        name: response.data.description,
        code: String(response.data.gtin),
        brand: response.data.brand.name,
        thumbnail: response.data.thumbnail,
    };
}

async function allowExternalQuery(): Promise<void> {
    console.log('Removing block for external api request');
    console.log(new Date());

    const cache = new Cache();
    await cache.invalidade('stop_external_ean_api_request');
}

export {
    findProductByEANExternal,
    findProductByEANExternalResponse,
    allowExternalQuery,
};
