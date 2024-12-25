import { Request, Response } from 'express';
import * as admin from 'firebase-admin';

import { getProductImageURL } from '@services/AWS';

import { findProductByEAN } from '@utils/ProductSearch/Find';
import { getUserByFirebaseId } from '@utils/User/Find';
import { getTeamFromUser } from '@utils/User/Team';
import { getProductsFromTeam } from '@utils/Team/Products';

import AppError from '@errors/AppError';

class ProductSearchController {
    async index(req: Request, res: Response): Promise<Response> {
        const { query } = req.query;

        if (!query) {
            throw new AppError({ message: 'Query is missing' });
        }

        const queryWithoutLetters = String(query).replace(/\D/g, '').trim();
        const q = queryWithoutLetters.replace(/^0+/, ''); // Remove zero on begin

        const product = await findProductByEAN({ code: q });

        if (!product && req.headers.authorization) {
            const [, token] = req.headers.authorization.split(' ');

            const auth = admin.auth();
            const { uid } = await auth.verifyIdToken(token);

            const user = await getUserByFirebaseId(uid);
            const team = await getTeamFromUser(user.id);

            if (team) {
                const { products } = await getProductsFromTeam({
                    team_id: team.team.id,
                    user_id: user.id,
                    search: q,
                });

                if (products.length > 0) {
                    let photo: undefined | string;

                    if (!photo && products[0].code) {
                        photo = await getProductImageURL(products[0].code);
                    }

                    return res.json({
                        name: products[0].name,
                        code: products[0].code,
                        thumbnail: photo,
                    });
                }
            }
        }

        return res.json(product);
    }
}

export default new ProductSearchController();
