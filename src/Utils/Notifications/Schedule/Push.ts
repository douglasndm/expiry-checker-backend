import admin from 'firebase-admin';

import { getAllUserRoles } from '@utils/UserRoles';
import { getAllTeamsExpiredProducts } from '@utils/Notifications/Teams';
import { getAllUsersDevices } from '@utils/Notifications/Users';

interface UserToNotificate {
    id: string;
    device_id?: string;
}

interface TeamToNotificate {
    id: string;
    name: string;
    expiredBatches?: number;
    nextExpBatches?: number;
    users: UserToNotificate[];
}

export async function dailyPushNotification(): Promise<void> {
    const allRoles = await getAllUserRoles();

    const teamsToNotificate: Array<TeamToNotificate> = [];

    allRoles.forEach(role => {
        const alreadyAdded = teamsToNotificate.find(
            team => team.id === role.team.id,
        );

        if (alreadyAdded) {
            alreadyAdded.users.push({
                id: role.user.id,
            });
            return;
        }

        teamsToNotificate.push({
            id: role.team.id,
            name: role.team.name,
            users: [
                {
                    id: role.user.id,
                },
            ],
        });
    });

    const teamProducts = await getAllTeamsExpiredProducts();

    teamProducts.forEach(t => {
        const team = teamsToNotificate.find(tn => tn.id === t.id);

        if (team) {
            let expired_batches = 0;
            let next_to_exp = 0;

            t.products.forEach(product => {
                expired_batches += product.expired_batches.length;
                next_to_exp += product.nextToExp_batches.length;
            });

            team.expiredBatches = expired_batches;
            team.nextExpBatches = next_to_exp;
        }
    });

    const usersDevices = await getAllUsersDevices();

    teamsToNotificate.forEach(team => {
        // busca o usuário na lista de times para enviar notificação
        // e atrui a ele o device id para enviar a notificação
        team.users.forEach(user => {
            const user_device = usersDevices.find(u => u.user.id === user.id);

            if (user_device) {
                user.device_id = user_device.device_id;
            }
        });
    });

    const onlyTeamsWithNextOrExpBatches = teamsToNotificate.filter(team => {
        if (!team.expiredBatches && !team.nextExpBatches) {
            return false;
        }
        if (
            team.expiredBatches &&
            team.expiredBatches < 0 &&
            team.nextExpBatches &&
            team.nextExpBatches < 0
        ) {
            return false;
        }
        return true;
    });

    const messages: TokenMessage[] = [];

    onlyTeamsWithNextOrExpBatches.forEach(team => {
        team.users.forEach(userNote => {
            if (userNote.device_id) {
                let message = '';

                if (team.expiredBatches && team.expiredBatches > 0) {
                    if (team.nextExpBatches && team.nextExpBatches > 0) {
                        message = `Você tem ${team.expiredBatches} lotes vencidos e ${team.nextExpBatches} lotes próximos ao vencimento`;
                    } else {
                        message = `Você tem ${team.expiredBatches} lotes vencidos`;
                    }
                } else if (team.nextExpBatches && team.nextExpBatches > 0) {
                    message = `Você tem ${team.nextExpBatches} lotes próximos ao vencimento`;
                }

                messages.push({
                    token: userNote.device_id,
                    notification: {
                        title: 'Seus produtos precisam de atenção',
                        body: message,
                    },
                });
            }
        });
    });

    const messaging = admin.messaging();
    await messaging.sendAll(messages);
}
