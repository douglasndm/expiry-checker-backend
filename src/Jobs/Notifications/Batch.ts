import { getRepository } from 'typeorm';
import { format } from 'date-fns';

import Batch from '@models/Batch';

import { getUserRoleInTeam } from '@utils/UserRoles';
import { getAllUsersFromTeamWithDevices } from '@utils/Team/Users';
import {
    IOneSignalBatchPushNotification,
    sendNotificationByFirebase,
    sendNotificationByOneSignal,
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

    const batchRepository = getRepository(Batch);

    const batch = await batchRepository
        .createQueryBuilder('batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('product.team', 'prodTeams')
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

    const users = await getAllUsersFromTeamWithDevices({
        team_id: team.id,
    });

    const messages: TokenMessage[] = [];

    const formatedDate = format(batch.exp_date, 'dd-MM-yyyy');
    const messageString = `${batch.product.name} tem um lote que vence em ${formatedDate}`;
    const deeplinking = `expiryteams://product/${batch.product.id}`;

    const oneSignalUsers: IOneSignalBatchPushNotification = {
        users_id: [],
        batch,
        message: messageString,
    };

    users.forEach(u => {
        if (u.id !== user_id) {
            // check if user made at least one login and save its token
            if (u.login) {
                const { login } = u;
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
                } else if (login.oneSignalToken) {
                    oneSignalUsers.users_id.push(u.id);
                }
            }
        }
    });

    if (messages.length <= 0 && oneSignalUsers.users_id.length <= 0) {
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

        if (oneSignalUsers.users_id.length > 0) {
            await sendNotificationByOneSignal(oneSignalUsers);
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
