import { addDays, format, isBefore } from 'date-fns';
import * as Sentry from '@sentry/node';

import BackgroundJob from '@services/Background';

import { getTeamsWithActiveSubscriptions } from '@utils/Subscriptions/Actives';
import { getUsersAllowedToSendMail } from '@utils/Notifications/Mail/UsersAllowed';

import { getAllProductsFromManyTeams } from '@functions/Team/Products';
import { getAllUsersIDAllowedToSendEmail } from './index';

import UserTeam from '@models/UserTeam';
import Store from '@models/Store';

async function sendMail(): Promise<void> {
	const checkInId = Sentry.captureCheckIn({
		monitorSlug: 'weekly-mail-notifications',
		status: 'in_progress',
	});

	const filtedUsersTeams = await getUsersAllowedToSendMail();

	// remove duplicades team before get all products
	const teams: UserTeam[] = [];

	filtedUsersTeams.forEach(item => {
		const alreadyInArray = teams.find(i => i.team.id === item.team.id);

		if (!alreadyInArray) {
			teams.push(item);
		}
	});

	const teamsWithSubscriptions = await getTeamsWithActiveSubscriptions();

	const activeTeams = teams.filter(userRole => {
		const finded = teamsWithSubscriptions.find(teamSub => {
			if (teamSub.team.id === userRole.team.id) {
				return true;
			}

			return false;
		});

		return finded;
	});

	const teamsIds = activeTeams.map(team => team.team.id);

	// avoid cron crash if nobody wants email notification
	if (teamsIds.length <= 0) {
		return;
	}

	const productsTeams = await getAllProductsFromManyTeams({
		teams: teamsIds,
	});

	const batches: Array<MailBatch> = [];

	productsTeams.forEach(productTeam => {
		if (productTeam.batches) {
			const onlyExpOrNextBatches = productTeam.batches.filter(b => {
				if (b.status === 'checked') return false;

				if (isBefore(b.exp_date, addDays(new Date(), 30))) {
					return true;
				}
				return false;
			});

			onlyExpOrNextBatches.forEach(b => {
				const alreadyInArray = batches.filter(
					batch => batch.team_id !== productTeam.team.id
				);

				if (alreadyInArray.length < 20) {
					batches.push({
						team_id: productTeam.team.id,
						store: productTeam.store || undefined,
						productName: productTeam.name,
						code: productTeam.code || null,
						amount: b.amount,
						batch: b.name,
						exp_date: format(b.exp_date, 'dd/MM/yyyy'),
					});
				}
			});
		}
	});

	const notifications: Omit<MailNotification, 'user_id'>[] = [];

	const allowedUsers = await getAllUsersIDAllowedToSendEmail();

	allowedUsers.forEach(user => {
		const userTeam = filtedUsersTeams.find(
			item => item.user.id === user.id
		);

		const userFilted = filtedUsersTeams.filter(
			ut => ut.user.id === user.id
		);

		const userStores: Store[] = [];

		userFilted.forEach(u => {
			if (u.user.store) {
				userStores.push(u.user.store.store);
			}
		});

		const teamBatches = batches.filter(b => {
			if (userStores.length > 0) {
				if (b.store) {
					const userInStore = userStores.find(
						store => store.id === b.store.id
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
				name: userTeam.user.email || 'untitled',
				to: userTeam.user.email,
				subject: `Resumo semanal dos produtos (${userTeam?.team.name})`,
				AppName: 'Controle de Validades',
				batches: teamBatches,
			});
		}
	});

	const notificationsWithBatches = notifications.filter(
		notification => notification.batches.length > 0
	);

	if (process.env.DEV_MODE === 'false') {
		notificationsWithBatches.forEach(async notification => {
			await BackgroundJob.add('SendWeeklyMail', {
				notification,
			});
		});
	}

	Sentry.captureCheckIn({
		checkInId,
		monitorSlug: 'weekly-mail-notifications',
		status: 'ok',
	});
}

export { sendMail };
