import axios from 'axios';
import { addDays, format, isBefore } from 'date-fns';

import { getAllUsersIDAllowedToSendEmail } from '@services/Notification/Email';

import { getAllUserRoles } from '@utils/UserRoles';
import { getAllProductsFromManyTeams } from '@functions/Team/Products';

import UserRoles from '@models/UserRoles';
import Store from '@models/Store';

async function sendMail(): Promise<void> {
    const usersTeams = await getAllUserRoles();

    const allowedUsers = await getAllUsersIDAllowedToSendEmail();

    const filtedUsersTeams = usersTeams.filter(item => {
        const isAllowed = allowedUsers.find(
            elemnt => elemnt.id === item.user.id,
        );

        if (!isAllowed) {
            return false;
        }
        return true;
    });

    // remove duplicades team before get all products
    const teams: UserRoles[] = [];

    filtedUsersTeams.forEach(item => {
        const alreadyInArray = teams.find(i => i.team.id === item.team.id);

        if (!alreadyInArray) {
            teams.push(item);
        }
    });

    const teamsIds = teams.map(team => team.team.id);

    // avoid cron crash if nobody wants email notification
    if (teamsIds.length <= 0) {
        return;
    }

    const productsTeams = await getAllProductsFromManyTeams({
        teams: teamsIds,
    });

    const batches: Array<batch> = [];

    productsTeams.forEach(productTeam => {
        if (productTeam.product.batches) {
            const onlyExpOrNextBatches = productTeam.product.batches.filter(
                b => {
                    if (b.status === 'checked') return false;

                    if (isBefore(b.exp_date, addDays(new Date(), 30))) {
                        return true;
                    }
                    return false;
                },
            );

            onlyExpOrNextBatches.forEach(b => {
                batches.push({
                    team_id: productTeam.team.id,
                    store: productTeam.product.store || undefined,
                    productName: productTeam.product.name,
                    code: productTeam.product.code || null,
                    amount: b.amount,
                    batch: b.name,
                    exp_date: format(b.exp_date, 'dd/MM/yyyy'),
                });
            });
        }
    });

    const notifications: MailNotification[] = [];

    allowedUsers.forEach(user => {
        const userTeam = filtedUsersTeams.find(
            item => item.user.id === user.id,
        );

        const userFilted = usersTeams.filter(ut => ut.user.id === user.id);

        const userStores: Store[] = [];

        userFilted.forEach(u => {
            u.user.stores.forEach(store => {
                userStores.push(store.store);
            });
        });

        const teamBatches = batches.filter(b => {
            if (userStores.length > 0) {
                if (b.store) {
                    const userInStore = userStores.find(
                        store => store.id === b.store.id,
                    );

                    if (userInStore) {
                        return true;
                    }

                    return false;
                }
            } else if (b.team_id === userTeam?.team.id) {
                return true;
            }

            return false;
        });

        if (userTeam && userTeam.user.email) {
            notifications.push({
                user_id: user.id,
                name: userTeam.user.email || 'untitled',
                to: userTeam.user.email,
                bcc: 'noreplay@douglasndm.dev',
                subject: `Resumo semanal dos produtos (${userTeam?.team.name})`,
                AppName: 'Controle de Validades',
                batches: teamBatches,
            });
        }
    });

    if (process.env.DEV_MODE === 'false')
        notifications.forEach(notification => {
            axios.post(`${process.env.MAIL_SERVICE_URL}/send`, notification);
        });
}

export { sendMail };
