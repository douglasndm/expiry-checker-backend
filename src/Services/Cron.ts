import schedule from 'node-schedule';
import axios from 'axios';
import { addDays, format, isBefore } from 'date-fns';

import { getAllUsersIDAllowedToSendEmail } from '@services/Notification/Email';

import { dailyPushNotification } from '@utils/Notifications/Schedule/Push';

import { getAllRoles as UserAndTeams } from '@functions/UserRoles';
import { getAllProductsFromManyTeams } from '@functions/Team/Products';

import UserRoles from '@models/UserRoles';

// every monday -> friday at 8
const dailyPushJob = schedule.scheduleJob(
    '0 11 * * 1,2,3,4,5',
    dailyPushNotification,
);

const job = schedule.scheduleJob(
    process.env.MAIL_NOTIFICATION_PERIOD || '0 9 * * 1',
    async () => {
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
                        productName: productTeam.product.name,
                        code: productTeam.product.code || null,
                        amount: b.amount,
                        batch: b.name,
                        exp_date: format(b.exp_date, 'dd/MM/yyyy'),
                    });
                });
            }
        });

        interface Notification {
            to: string;
            bcc?: string;
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

            const teamBatches = batches.filter(
                b => b.team_id === userTeam?.team.id,
            );

            if (userTeam && userTeam.user.email) {
                notifications.push({
                    name: userTeam.user.email || 'untitled',
                    to: userTeam.user.email,
                    bcc: 'nucleodosdownloads@outlook.com',
                    subject: `Resumo semanal dos produtos (${userTeam?.team.name})`,
                    AppName: 'Controle de Validades',
                    batches: teamBatches,
                });
            }
        });

        if (true === false)
            notifications.forEach(notificaiton => {
                axios.post(
                    `${process.env.MAIL_SERVICE_URL}/send`,
                    notificaiton,
                );
            });
    },
);
