import { Request, Response } from 'express';

import {
	getExternalSubscriptionByTeamId,
	getSubscription,
} from '@utils/Subscriptions/Subscription';
import { deleteSubscription } from '@utils/Subscriptions/Delete';

import AppError from '@errors/AppError';

class SubscriptionController {
	async index(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		try {
			const subscription = await getSubscription(team_id);

			return res.json(subscription);
		} catch (error) {
			if (error instanceof AppError) {
				if (error.errorCode === 5) {
					return res.json(null);
				}

				throw error;
			}
		}

		return res.json(null);
	}

	async delete(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		await deleteSubscription(team_id);

		return res.send();
	}

	async storeData(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const response = await getExternalSubscriptionByTeamId(team_id);

		return res.json(response);
	}
}

export default new SubscriptionController();
