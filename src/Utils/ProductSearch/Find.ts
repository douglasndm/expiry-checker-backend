import { getRepository } from 'typeorm';
import axios from 'axios';
import * as Yup from 'yup';
import { formatInTimeZone } from 'date-fns-tz';

import Cache from '@services/Cache';
import BackgroundJob from '@services/Background';
import { getProductImageURL } from '@services/AWS';

import ProductDetails from '@models/ProductDetails';

import AppError from '@errors/AppError';

import { findProductByEANExternal } from './ExternalQuery';

interface findProductByEANProps {
    code: string;
}

async function findProductByEAN({
    code,
}: findProductByEANProps): Promise<ProductDetails | null> {
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

    const queryWithoutLetters = code.replace(/\D/g, '').trim();
    const query = queryWithoutLetters.replace(/^0+/, ''); // Remove zero on begin

    const cache = new Cache();

    const cachedProduct = await cache.get<ProductDetails>(
        `product_suggestion:${query}`,
    );

    console.log(cachedProduct);

    if (cachedProduct) {
        return {
            ...cachedProduct,
            thumbnail: getProductImageURL(cachedProduct.code),
        };
    }

    const productRepository = getRepository(ProductDetails);
    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code = :code', { code: `${query}` })
        .select(['product.name', 'product.brand', 'product.thumbnail'])
        .getOne();

    if (!product) {
        const blockRequest = await cache.get<boolean>(
            'stop_external_ean_api_request',
        );

        let externalProduct: null | findProductByEANExternalResponse = null;

        if (blockRequest !== true) {
            try {
                const externalSearch = await findProductByEANExternal(query);

                if (externalSearch.name) {
                    externalProduct = externalSearch;
                }
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    let formatedDate = formatInTimeZone(
                        new Date(),
                        'America/Sao_Paulo',
                        'dd-MM-yyyy HH:mm:ss zzzz',
                    );

                    // No erro 429 antigimos o limite da api, a partir daqui desabilitamos as consultas
                    // até o próximo dia
                    if (err.response?.status === 429) {
                        formatedDate = formatInTimeZone(
                            new Date(),
                            'America/Sao_Paulo',
                            'dd-MM-yyyy HH:mm:ss zzzz',
                        );
                        console.log('Blocking for external api request');
                        console.log(formatedDate);

                        await cache.save('stop_external_ean_api_request', true);
                    }
                } else if (err instanceof Error) {
                    console.log(
                        `Erro while searching ${query} at external source`,
                    );
                    console.error(err);
                }
            }
        }

        await BackgroundJob.add('HandleAfterProductSearch', {
            response: externalProduct,
            code: query,
        });

        if (externalProduct) {
            const prod: ProductDetails = {
                name: externalProduct.name,
                code: externalProduct.code,
                brand: externalProduct.brand,
                id: 'Generating',
                lastTimeChecked: null,
                created_at: new Date(),
                updated_at: new Date(),
            };

            return prod;
        }
    }

    let photo: undefined | string;

    if (product?.thumbnail) {
        if (product.thumbnail.startsWith('http')) {
            photo = product.thumbnail;
        }
    }

    if (!photo && product) {
        photo = getProductImageURL(product.code);
    }

    cache.save(`product_suggestion:${query}`, {
        ...product,
    });

    return {
        ...product,
        thumbnail: photo,
    };
}

export { findProductByEAN };
