import admin from 'firebase-admin';

import { getAllTeamsExpiredProducts } from '@utils/Notifications/Teams';
import { getAllLoginsFromAllUsers } from '@utils/User/Login';
import { getAllStoreTeamsToNotificate } from './TeamStores';

export async function dailyPushNotification(): Promise<void> {
    const teamsToNotificate = await getAllStoreTeamsToNotificate();

    const teamProducts = await getAllTeamsExpiredProducts();

    teamProducts.forEach(team => {
        const teamIndex = teamsToNotificate.findIndex(
            t => t.team_id === team.id,
        );

        const teamNote = teamsToNotificate[teamIndex];

        team.products.forEach(product => {
            const storeIndex = teamNote.stores.findIndex(
                store => store.id === product.store_id,
            );

            const store = teamNote.stores[storeIndex];

            if (store) {
                if (store.expiredBatches !== undefined) {
                    store.expiredBatches += product.expired_batches.length;
                }
                if (store.nextExpBatches !== undefined) {
                    store.nextExpBatches += product.nextToExp_batches.length;
                }
            }

            // Adiciona também a quantidade de vencidos/proximos a lista
            // de usuários que não tem loja definida
            // já que os usuários sem loja vão ter acesso a todos os produtos
            if (teamNote.noStore.expiredBatches !== undefined) {
                teamNote.noStore.expiredBatches +=
                    product.expired_batches.length;
            }
            if (teamNote.noStore.nextExpBatches !== undefined) {
                teamNote.noStore.nextExpBatches +=
                    product.nextToExp_batches.length;
            }
        });
    });

    const usersDevices = await getAllLoginsFromAllUsers();

    // busca o usuário na lista de times para enviar notificação
    // e atrui a ele o device id para enviar a notificação
    teamsToNotificate.forEach(team => {
        team.stores.forEach(store => {
            if (store.users) {
                store.users.forEach(user => {
                    const userDevice = usersDevices.find(
                        u => u.user.id === user.id,
                    );

                    if (userDevice) {
                        user.device_id = userDevice.firebaseMessagingToken;
                    }
                });
            }
        });

        team.noStore.users.forEach(user => {
            const userDevice = usersDevices.find(u => u.user.id === user.id);

            if (userDevice) {
                user.device_id = userDevice.firebaseMessagingToken;
            }
        });
    });

    const storesWithNotifications = teamsToNotificate.map(team => {
        const storesWithExpNextProds = team.stores.filter(store => {
            if (!store.expiredBatches && !store.nextExpBatches) {
                return false;
            }
            if (
                store.expiredBatches &&
                store.expiredBatches < 0 &&
                store.nextExpBatches &&
                store.nextExpBatches < 0
            ) {
                return false;
            }
            return true;
        });

        return {
            ...team,
            stores: storesWithExpNextProds,
        };
    });

    // Somente times que tenham notificações
    const teamWithNotifications = storesWithNotifications.filter(team => {
        if (team.stores.length > 0) {
            return true;
        }

        if (!team.noStore.expiredBatches && !team.noStore.nextExpBatches) {
            return false;
        }
        if (
            team.noStore.expiredBatches &&
            team.noStore.expiredBatches < 0 &&
            team.noStore.nextExpBatches &&
            team.noStore.nextExpBatches < 0
        ) {
            return false;
        }
        return true;
    });

    interface ITokenMessage {
        token: string;
        notification: {
            title: string;
            body: string;
        };
    }

    const messages: ITokenMessage[] = [];

    teamWithNotifications.forEach(team => {
        team.stores.forEach(store => {
            if (store.users) {
                store.users.forEach(user => {
                    if (user.device_id) {
                        let message = '';

                        if (store.expiredBatches && store.expiredBatches > 0) {
                            if (
                                store.nextExpBatches &&
                                store.nextExpBatches > 0
                            ) {
                                message = `Você tem ${store.expiredBatches} lotes vencidos e ${store.nextExpBatches} lotes próximos ao vencimento`;
                            } else {
                                message = `Você tem ${store.expiredBatches} lotes vencidos`;
                            }
                        } else if (
                            store.nextExpBatches &&
                            store.nextExpBatches > 0
                        ) {
                            message = `Você tem ${store.nextExpBatches} lotes próximos ao vencimento`;
                        }

                        messages.push({
                            token: user.device_id,
                            notification: {
                                title: 'Seus produtos precisam de atenção',
                                body: message,
                            },
                        });
                    }
                });
            }
        });

        team.noStore.users.forEach(user => {
            if (user.device_id) {
                let message = '';

                if (
                    team.noStore.expiredBatches &&
                    team.noStore.expiredBatches > 0
                ) {
                    if (
                        team.noStore.nextExpBatches &&
                        team.noStore.nextExpBatches > 0
                    ) {
                        message = `Você tem ${team.noStore.expiredBatches} lotes vencidos e ${team.noStore.nextExpBatches} lotes próximos ao vencimento`;
                    } else {
                        message = `Você tem ${team.noStore.expiredBatches} lotes vencidos`;
                    }
                } else if (
                    team.noStore.nextExpBatches &&
                    team.noStore.nextExpBatches > 0
                ) {
                    message = `Você tem ${team.noStore.nextExpBatches} lotes próximos ao vencimento`;
                }

                messages.push({
                    token: user.device_id,
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
