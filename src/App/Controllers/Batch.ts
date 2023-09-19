import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { parseISO, isValid, endOfDay } from 'date-fns';

import BackgroundJob from '@services/Background';

import Batch from '@models/Batch';

import { findBatchById } from '@utils/Product/Batch/Find';
import { createBatch } from '@utils/Product/Batch/Create';
import { updateBatch } from '@utils/Product/Batch/Update';
import { getUserRoleInTeam } from '@utils/UserRoles';
import { deleteBatch } from '@utils/Product/Batch/Delete';

import { checkIfUserHasAccessToAProduct } from '@functions/UserAccessProduct';
import { getProductTeam } from '@functions/Product/Team';

import AppError from '@errors/AppError';

import { IAction } from '~types/UserLogs';

class BatchController {
    async index(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { batch_id } = req.params;

        const batchReposity = getRepository(Batch);

        const batch = await batchReposity.findOne({
            where: { id: batch_id },
            relations: ['product'],
        });

        if (!batch) {
            throw new AppError({
                message: 'Batch was not found',
                statusCode: 400,
                internalErrorCode: 9,
            });
        }

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userUUID,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        return res.status(200).json(batch);
    }

    async store(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { team_id } = req.params;
        const { product_id, name, exp_date, amount, price } = req.body;

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id,
            user_id: req.userUUID,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        let date = parseISO(exp_date);

        if (!isValid(date)) {
            date = endOfDay(new Date(exp_date));
        }

        const createdBatch = await createBatch({
            product_id,
            name,
            exp_date: date,
            amount,
            price,
        });

        if (team_id)
            await BackgroundJob.add('LogChange', {
                user_id: req.userUUID,
                team_id,
                product_id,
                batch_id: createdBatch.id,
                action: IAction.Create_Batch,
                new_value: createdBatch.name,
            });

        return res.status(201).json(createdBatch);
    }

    async update(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { batch_id, team_id } = req.params;
        const { name, exp_date, amount, price, status } = req.body;

        const batch = await findBatchById(batch_id);

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userUUID,
        });

        if (!userHasAccess) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        let date = parseISO(exp_date);

        if (!isValid(date)) {
            date = endOfDay(new Date(exp_date));
        }

        const updatedBatch = await updateBatch({
            batch_id,
            name,
            exp_date: date,
            amount,
            price,
            status,
        });

        if (team_id) {
            if (!!status && status !== batch.status) {
                await BackgroundJob.add('LogChange', {
                    user_id: req.userUUID,
                    team_id,
                    product_id: batch.product.id,
                    batch_id: batch.id,
                    action: IAction.Set_Batch_Checked,
                    new_value: status,
                    old_value: batch.status,
                });
            }
        }

        return res.status(200).json(updatedBatch);
    }

    async delete(req: Request, res: Response): Promise<Response> {
        if (!req.userUUID) {
            throw new AppError({
                message: 'Provide the user id',
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        const { batch_id } = req.params;

        const batch = await findBatchById(batch_id);

        const team = await getProductTeam(batch.product);

        const userHasAccess = await checkIfUserHasAccessToAProduct({
            product_id: batch.product.id,
            user_id: req.userUUID,
        });
        const userRole = await getUserRoleInTeam({
            user_id: req.userUUID,
            team_id: team.id,
        });

        if (
            !userHasAccess ||
            (userHasAccess &&
                userRole !== 'manager' &&
                userRole !== 'supervisor')
        ) {
            throw new AppError({
                message: "You don't have authorization to be here",
                statusCode: 401,
                internalErrorCode: 2,
            });
        }

        await deleteBatch(batch_id);

        return res.status(204).send();
    }
}

export default new BatchController();
