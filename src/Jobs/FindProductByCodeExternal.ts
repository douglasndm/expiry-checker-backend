import { getRepository } from 'typeorm';

import ProductRequest from '@models/ProductRequest';
import ProductDetails from '@models/ProductDetails';

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

    try {
        const externalSearch = await findProductByEANExternal(query);

        if (externalSearch.name) {
            externalProduct = externalSearch;
        }
    } catch (err) {
        console.log(`Erro while search ${query} at Bluesoft`);
        console.error(err);
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
