import { format } from 'date-fns';

import { defaultDataSource } from '@services/TypeORM';

import Batch from '@models/Batch';

import { getUserRoleInTeam } from '@utils/UserRoles';
import { getAllUsersFromTeamWithDevices } from '@utils/Team/Users';
import {
    ITokenMessagePush,
    sendNotificationByFirebase,
} from '@utils/Notifications/Push/Batch';

import { getProductTeam } from '@functions/Product/Team';

import AppError from '@errors/AppError';

interface batchNotificationProps {
    data: {
        batch_id: string;
        user_id: string;
    };
}

async function batchNotification({
    data,
}: batchNotificationProps): Promise<void> {
    const { batch_id, user_id } = data;

    const batchRepository = defaultDataSource.getRepository(Batch);

    const batch = await batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('product.team', 'team')
        .where('batch.id = :batch_id', { batch_id })
        .getOne();

    if (!batch) {
        throw new AppError({
            message: 'Batch not found',
            statusCode: 400,
            internalErrorCode: 9,
        });
    }

    const team = await getProductTeam(batch.product);

    const role = await getUserRoleInTeam({
        user_id,
        team_id: team.id,
    });

    if (role !== 'manager' && role !== 'supervisor') {
        throw new AppError({
            message: "You don't have authorization to do this",
            statusCode: 401,
            internalErrorCode: 2,
        });
    }

    const users = await getAllUsersFromTeamWithDevices(team.id);

    const messages: ITokenMessagePush[] = [];

    const formatedDate = format(batch.exp_date, 'dd-MM-yyyy');
    const messageString = `${batch.product.name} tem um lote que vence em ${formatedDate}`;
    const deeplinking = `expiryteams://product/${batch.product.id}`;

    users.forEach(u => {
        if (u.id !== user_id) {
            // check if user made at least one login and save its token
            if (u.login) {
                const token = u.login.firebaseMessagingToken;

                if (
                    token !== undefined &&
                    token !== null &&
                    token.trim() !== ''
                ) {
                    messages.push({
                        notification: {
                            title: 'Verifique esse produto',
                            body: messageString,
                        },
                        data: {
                            deeplinking,
                        },
                        token,
                    });
                }
            }
        }
    });

    if (messages.length <= 0) {
        throw new AppError({
            message: 'There are no users to send',
            statusCode: 400,
            internalErrorCode: 27,
        });
    }

    try {
        if (messages.length > 0) {
            await sendNotificationByFirebase(messages);
        }
    } catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
    }
}

export default {
    key: 'SendBatchNotification',
    handle: batchNotification,
};
