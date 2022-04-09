import { getRepository } from 'typeorm';

import ProductDetails from '@models/ProductDetails';
import ProductRequest from '@models/ProductRequest';

interface handleAfterProductSearchProps {
    data: { response: findProductByEANExternalResponse | null; code: string };
}

async function handleAfterProductSearch({
    data,
}: handleAfterProductSearchProps): Promise<void> {
    const { response, code } = data;

    const productRepository = getRepository(ProductDetails);
    const productRequestRepository = getRepository(ProductRequest);

    const request = await productRequestRepository
        .createQueryBuilder('request')
        .where('request.code = :code', { code })
        .getOne();

    if (request) {
        if (response !== null) {
            await productRequestRepository.remove(request);
        } else {
            request.rank += 1;

            await productRequestRepository.save(request);
        }
    } else if (!response) {
        if (code.trim().length >= 8) {
            const productRequest = new ProductRequest();
            productRequest.code = code.trim();
            productRequest.rank = 1;

            await productRequestRepository.save(productRequest);
        }
    } else if (response) {
        const alreadyExists = await productRepository
            .createQueryBuilder('product')
            .where('product.code = :code', { code: response.code })
            .getOne();

        if (!alreadyExists) {
            const newProduct = new ProductDetails();
            newProduct.name = response.name;
            newProduct.code = response.code;
            newProduct.brand = response.brand;
            newProduct.thumbnail = response.thumbnail;

            await productRepository.save(newProduct);
        }
    }
}

export default {
    key: 'HandleAfterProductSearch',
    handle: handleAfterProductSearch,
};
