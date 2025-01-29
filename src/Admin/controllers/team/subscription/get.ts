import { Request, Response } from 'express';

import { getSubscriptionFromTeam } from '@utils/Team/Subscription/Get';

class GetSubscriptionController {
	async index(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const subscriptions = await getSubscriptionFromTeam(team_id);

		return res.json(subscriptions);
	}
}

export default new GetSubscriptionController();
