import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductDetails from '@models/ProductDetails';
import ProductRequest from '@models/ProductRequest';

import AppError from '@errors/AppError';

import {
    findProductByEANExternal,
    findProductByEANExternalResponse,
} from './ExternalQuery';

interface findProductByEANProps {
    code: string;
}

async function findProductByEAN({
    code,
}: findProductByEANProps): Promise<ProductDetails | null> {
    return null;
    const schema = Yup.object().shape({
        code: Yup.string().required().min(8),
    });

    try {
        await schema.validate({ code });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({ message: err.message });
        }
    }

    const productRepository = getRepository(ProductDetails);

    const queryWithoutLetters = code.replace(/\D/g, '');
    const query = queryWithoutLetters.replace(/^0+/, ''); // Remove zero on begin

    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code = :code', { code: `${query}` })
        .getOne();

    if (!product) {
        const productRequestRepository = getRepository(ProductRequest);

        const request = await productRequestRepository
            .createQueryBuilder('request')
            .where('request.code = :code', { code: `${query}` })
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

                const savedProduct = await productRepository.save(newProduct);

                return savedProduct;
            }
        }
    }

    return product || null;
}

export { findProductByEAN };
