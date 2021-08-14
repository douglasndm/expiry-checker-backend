import schedule from 'node-schedule';
import axios from 'axios';
import { addDays, format, isAfter } from 'date-fns';

import { getAllUsersIDAllowedToSendEmail } from '@services/Notification/Email';

import { getAllRoles as UserAndTeams } from '@utils/UserRoles';
import { getAllProductsFromManyTeams } from '@utils/Team/Products';

import UserRoles from '@models/UserRoles';

const job = schedule.scheduleJob('0 * * * *', async () => {
    const usersTeams = await UserAndTeams();
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

    interface batch {
        team_id: string;
        code: string | null;
        productName: string;
        batch: string | null;
        exp_date: string;
        amount: number | null;
    }

    const batches: Array<batch> = [];

    productsTeams.forEach(productTeam => {
        if (productTeam.product.batches) {
            const onlyExpOrNextBatches = productTeam.product.batches.filter(b =>
                isAfter(addDays(new Date(), 30), b.exp_date),
            );

            onlyExpOrNextBatches.forEach(b => {
                batches.push({
                    team_id: productTeam.team.id,
                    productName: productTeam.product.name,
                    code: productTeam.product.code || null,
                    amount: b.amount,
                    batch: b.name,
                    exp_date: format(b.exp_date, 'dd/MM/yyyy'),
                });
            });
        }
    });

    const sortedBatches = batches.sort((batch1, batch2) => {
        if (batch1.exp_date > batch2.exp_date) return 1;
        if (batch1.exp_date < batch2.exp_date) return -1;
        return 0;
    });

    interface Notification {
        to: string;
        subject: string;
        name: string;
        AppName: string;
        batches: batch[];
    }

    const notifications: Notification[] = [];

    allowedUsers.forEach(user => {
        const userTeam = filtedUsersTeams.find(
            item => item.user.id === user.id,
        );

        const teamBatches = sortedBatches.filter(
            b => b.team_id === userTeam?.team.id,
        );

        notifications.push({
            name: userTeam?.user.email || 'untitled',
            to: 'nucleodosdownloads@outlook.com',
            subject: `Resumo semanal de vencimentos (${userTeam?.team.name})`,
            AppName: 'Controle de Validades',
            batches: teamBatches,
        });
    });

    notifications.forEach(notificaiton => {
        axios.post(`${process.env.MAIL_SERVICE_URL}/send`, notificaiton);
    });
});
