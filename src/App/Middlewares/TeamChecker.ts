import { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserRoles from '@models/UserRoles';

import AppError from '@errors/AppError';

export async function checkTeamId(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate(req.params);
    } catch (err) {
        throw new AppError({
            message: 'Team id is not valid',
            statusCode: 400,
            internalErrorCode: 1,
        });
    }

    return next();
}

export async function checkIfUserIsPending(
    req: Request,
    res: Response,
    next: NextFunction,
): Promise<void> {
    if (!req.userId) {
        throw new AppError({
            message: 'Provider the user id',
            statusCode: 401,
            internalErrorCode: 2,
        });
    }

    const userRolesRepo = getRepository(UserRoles);

    const { team_id } = req.params;

    const userInTeam = await userRolesRepo
        .createQueryBuilder('userRole')
        .leftJoinAndSelect('userRole.team', 'team')
        .leftJoinAndSelect('userRole.user', 'user')
        .where('user.firebaseUid = :user_id', { user_id: req.userId })
        .andWhere('team.id = :team_id', { team_id })
        .getOne();

    if (!userInTeam) {
        throw new AppError({
            message: 'User is not in team',
            statusCode: 401,
            internalErrorCode: 17,
        });
    }

    if (userInTeam.status && userInTeam.status.toLowerCase() !== 'completed') {
        throw new AppError({
            message: 'User is still pending to enter the team',
            statusCode: 401,
            internalErrorCode: 19,
        });
    }

    return next();
}
