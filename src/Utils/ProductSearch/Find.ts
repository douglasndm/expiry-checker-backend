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
    const schema = Yup.object().shape({
        code: Yup.string().required(),
    });

    try {
        await schema.validate({ code });
    } catch (err) {
        throw new AppError({ message: 'Invalid product code' });
    }

    const productRepository = getRepository(ProductDetails);

    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code like :code', { code: `%${code}%` })
        .getOne();

    if (!product) {
        const productRequestRepository = getRepository(ProductRequest);

        const request = await productRequestRepository
            .createQueryBuilder('request')
            .where('request.code like :code', { code: `%${code}%` })
            .getOne();

        let externalProduct: null | findProductByEANExternalResponse = null;

        try {
            const externalSearch = await findProductByEANExternal(code);

            if (externalSearch.name) {
                externalProduct = externalSearch;
            }
        } catch (err) {
            console.log(`Erro while search ${code} at Bluesoft`);
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
            productRequest.code = code;
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
