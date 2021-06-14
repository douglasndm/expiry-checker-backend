import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import * as Yup from 'yup';

import { addUserDevice } from '@utils/Users/Device';

class SessionController {
    async store(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            device_id: Yup.string().required('Provider the device id'),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Provider the device id' });
        }

        try {
            if (req.headers.authorization) {
                try {
                    const { device_id } = req.body;
                    const [, token] = req.headers.authorization.split(' ');

                    const auth = admin.auth();
                    const verifyToken = await auth.verifyIdToken(token);

                    req.userId = verifyToken.uid;

                    await addUserDevice({
                        user_id: verifyToken.uid,
                        device_id,
                    });

                    return res.status(201).send();
                } catch (err) {
                    return res.status(403).json({ error: 'Unauthorized' });
                }
            }
            return res.status(403).json({ error: 'Unauthorized' });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new SessionController();
