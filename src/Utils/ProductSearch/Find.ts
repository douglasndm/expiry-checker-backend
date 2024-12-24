import axios from 'axios';
import * as Yup from 'yup';
import { formatInTimeZone } from 'date-fns-tz';

import { defaultDataSource } from '@project/ormconfig';

import { saveOnCache, getFromCache } from '@services/Cache/Redis';

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

    const cachedProduct = await getFromCache<ProductDetails>(
        `product_suggestion:${code}`,
    );

    if (cachedProduct?.name) {
        return {
            ...cachedProduct,
            thumbnail: getProductImageURL(code),
        };
    }

    const productRepository = defaultDataSource.getRepository(ProductDetails);
    const product = await productRepository
        .createQueryBuilder('product')
        .where('product.code = :code', { code: `${code}` })
        .select(['product.name', 'product.brand', 'product.thumbnail'])
        .getOne();

    if (!product) {
        const blockRequest = await getFromCache<boolean>(
            'external_api_request',
        );

        let externalProduct: null | findProductByEANExternalResponse = null;

        if (blockRequest !== true) {
            try {
                const externalSearch = await findProductByEANExternal(code);

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

                        await saveOnCache('external_api_request', true);
                    }
                } else if (err instanceof Error) {
                    console.log(
                        `Erro while searching ${code} at external source`,
                    );
                    console.error(err);
                }
            }
        }

        await BackgroundJob.add('HandleAfterProductSearch', {
            response: externalProduct,
            code,
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
        photo = getProductImageURL(code);
    }

    saveOnCache(`product_suggestion:${code}`, {
        ...product,
    });

    if (!product) {
        return null;
    }

    return {
        ...product,
        thumbnail: photo,
    };
}

export { findProductByEAN };
