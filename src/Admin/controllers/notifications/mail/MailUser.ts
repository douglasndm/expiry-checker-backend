import { Request, Response } from 'express';
import { addDays, format, isBefore } from 'date-fns';

import { getUserById } from '@utils/User/Find';
import { getTeamFromUser } from '@utils/User/Team';
import { getAllProductsFromTeam } from '@utils/Product/List';
import { sendMail } from '@utils/Notifications/Mail/Send';

import AppError from '@errors/AppError';

class MailUserController {
	async store(req: Request, res: Response): Promise<Response> {
		const { user_id } = req.body;

		const user = await getUserById(user_id);
		const team = await getTeamFromUser(user_id);

		if (!team) {
			throw new AppError({
				message: 'User is not in team',
			});
		}

		const products = await getAllProductsFromTeam(team.team.id);

		const batches: Array<MailBatch> = [];

		products.forEach(product => {
			if (product.batches) {
				const onlyExpOrNextBatches = product.batches.filter(b => {
					if (b.status === 'checked') return false;

					if (isBefore(b.exp_date, addDays(new Date(), 30))) {
						return true;
					}
					return false;
				});

				onlyExpOrNextBatches.forEach(b => {
					if (batches.length <= 20) {
						batches.push({
							team_id: product.team.id,
							store: product.store || undefined,
							productName: product.name,
							code: product.code || null,
							amount: b.amount,
							batch: b.name,
							exp_date: format(b.exp_date, 'dd/MM/yyyy'),
						});
					}
				});
			}
		});

		await sendMail({
			data: {
				notification: {
					name: user.name || user.email,
					to: user.email,
					subject: `Resumo dos produtos (${team.team.name})`,
					AppName: 'Controle de Validades',
					batches: batches,
				},
			},
		});

		return res.json(batches);
	}
}

export default new MailUserController();
