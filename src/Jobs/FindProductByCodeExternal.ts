import { getRepository } from 'typeorm';
import axios from 'axios';

import ProductRequest from '@models/ProductRequest';
import ProductDetails from '@models/ProductDetails';

import Cache from '@services/Cache';

import {
    findProductByEANExternal,
    findProductByEANExternalResponse,
} from '@utils/ProductSearch/ExternalQuery';

interface handleProps {
    data: {
        code: string;
    };
}

async function handle({ data }: handleProps): Promise<void> {
    const query = data.code;

    const productRepository = getRepository(ProductDetails);
    const productRequestRepository = getRepository(ProductRequest);

    const request = await productRequestRepository
        .createQueryBuilder('request')
        .where('request.code = :code', { code: ` ${query}` })
        .getOne();

    let externalProduct: null | findProductByEANExternalResponse = null;

    const cache = new Cache();
    const blockRequest = await cache.get<boolean>(
        'stop_external_ean_api_request',
    );

    if (blockRequest !== true) {
        try {
            const externalSearch = await findProductByEANExternal(query);

            if (externalSearch.name) {
                externalProduct = externalSearch;
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                // No erro 429 antigimos o limite da api, a partir daqui desabilitamos as consultas
                // até o próximo dia
                if (err.response?.status === 429) {
                    console.log('Blocking for external api request');
                    console.log(new Date());

                    await cache.save('stop_external_ean_api_request', true);
                }
            } else if (err instanceof Error) {
                console.log(`Erro while search ${query} at Bluesoft`);
                console.error(err.message);
            }
        }
    }

    if (request) {
        if (externalProduct !== null) {
            await productRequestRepository.remove(request);
        } else {
            request.rank += 1;

            await productRequestRepository.save(request);
        }
    } else if (!externalProduct) {
        const productRequest = new ProductRequest();
        productRequest.code = query;
        productRequest.rank = 1;

        await productRequestRepository.save(productRequest);
    } else if (externalProduct) {
        const alreadyExists = await productRepository
            .createQueryBuilder('product')
            .where('product.code = :code', { code: externalProduct.code })
            .getOne();

        if (!alreadyExists) {
            const newProduct = new ProductDetails();
            newProduct.name = externalProduct.name;
            newProduct.code = externalProduct.code;
            newProduct.brand = externalProduct.brand;
            newProduct.thumbnail = externalProduct.thumbnail;

            await productRepository.save(newProduct);
        }
    }
}

export default {
    key: 'FindProductByCodeExternal',
    handle,
};
