import { getRepository } from 'typeorm';
import { formatInTimeZone } from 'date-fns-tz';

import Cache from '@services/Cache';

import ProductRequest from '@models/ProductRequest';

import { findProductByEAN } from './Find';

async function getProductsRequestsByRank(
    limit?: number,
): Promise<ProductRequest[]> {
    const requestRepository = getRepository(ProductRequest);

    const products = await requestRepository
        .createQueryBuilder('request')
        .orderBy('request.rank')
        .where('length(request.code) > 7')
        .limit(limit)
        .getMany();

    return products;
}

async function callRemainingDailyAPICalls(): Promise<void> {
    const cache = new Cache();
    const blockRequest = await cache.get<boolean>(
        'stop_external_ean_api_request',
    );

    if (blockRequest !== true) {
        const requests = await getProductsRequestsByRank(100);

        requests.forEach(async request => {
            await findProductByEAN({ code: request.code });
        });
    }
    const formatedDate = formatInTimeZone(
        new Date(),
        'America/Sao_Paulo',
        'dd-MM-yyyy HH:mm:ss zzzz',
    );
    console.log(
        'Tried to request remaing API request but it is already blocked for external api request',
    );
    console.log(formatedDate);
}

export { callRemainingDailyAPICalls };
