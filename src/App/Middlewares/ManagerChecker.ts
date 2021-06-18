import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import AppError from '@errors/AppError';

import UserRoles from '../Models/UserRoles';

async function CheckIfUserIsManager(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void | Response> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
    });

    if (!(await schema.isValid(req.params))) {
        throw new AppError('Provider the team id', 401);
    }

    const { team_id } = req.params;

    const userRolesRepository = getRepository(UserRoles);
    const user = await userRolesRepository.findOne({
        where: {
            team: { id: team_id },
            user: { firebaseUid: req.userId },
        },
    });

    if (user?.role.toLocaleLowerCase() !== 'manager') {
        return res
            .status(401)
            .json({ error: 'You dont have permission to be here' });
    }

    return next();
}

export default CheckIfUserIsManager;
