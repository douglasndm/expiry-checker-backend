import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserRoles from '../Models/UserRoles';

async function CheckIfUserIsManager(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const schema = Yup.object().shape({
        id: Yup.string().required().uuid(),
    });

    if (!(await schema.isValid(req.params))) {
        return res.status(400).json({ error: 'Provider the team id' });
    }

    try {
        const { id } = req.params;

        const userRolesRepository = getRepository(UserRoles);
        const user = await userRolesRepository.findOne({
            where: {
                team: { id },
                user: { id: req.userId },
            },
        });

        if (user?.role.toLocaleLowerCase() !== 'manager') {
            return res
                .status(401)
                .json({ error: 'You dont have permission to be here' });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export default CheckIfUserIsManager;
