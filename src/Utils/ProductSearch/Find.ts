import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import ProductDetails from '@models/ProductDetails';
import ProductRequest from '@models/ProductRequest';

import AppError from '@errors/AppError';

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

        if (request) {
            request.rank += 1;

            await productRequestRepository.save(request);
        } else {
            const productRequest = new ProductRequest();
            productRequest.code = code;
            productRequest.rank = 1;

            await productRequestRepository.save(productRequest);
        }
    }

    return product || null;
}

export { findProductByEAN };
