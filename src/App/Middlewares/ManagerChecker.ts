import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';

import AppError from '@errors/AppError';

import UserRoles from '@models/UserRoles';

async function CheckIfUserIsManager(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const { team_id } = req.params;

    const userRolesRepository = getRepository(UserRoles);
    const user = await userRolesRepository.findOne({
        where: {
            team: { id: team_id },
            user: { firebaseUid: req.userId },
        },
    });

    if (user?.role.toLocaleLowerCase() !== 'manager') {
        throw new AppError({
            message: '',
            statusCode: 401,
            internalErrorCode: 2,
        });
    }

    return next();
}

export default CheckIfUserIsManager;
