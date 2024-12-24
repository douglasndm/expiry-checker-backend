import { formatInTimeZone } from 'date-fns-tz';

import { defaultDataSource } from '@project/ormconfig';

import { getFromCache } from '@services/Cache/Redis';

import ProductRequest from '@models/ProductRequest';

import { findProductByEAN } from './Find';

async function getProductsRequestsByRank(
    limit?: number,
): Promise<ProductRequest[]> {
    const requestRepository = defaultDataSource.getRepository(ProductRequest);

    const products = await requestRepository
        .createQueryBuilder('request')
        .orderBy('request.rank')
        .where('length(request.code) > 7')
        .limit(limit)
        .getMany();

    return products;
}

async function callRemainingDailyAPICalls(): Promise<void> {
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
        'dd-MM-yyyy HH:mm:ss zzzz',
    );
    console.log(
        'Tried to request remaing API request but it is already blocked for external api request',
    );
    console.log(formatedDate);
}

export { callRemainingDailyAPICalls };
