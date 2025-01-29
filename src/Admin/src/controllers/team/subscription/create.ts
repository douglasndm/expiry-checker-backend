import { Request, Response } from 'express';
import { parseISO, startOfDay } from 'date-fns';
import * as Yup from 'yup';

import { createTeamSubscription } from '@admin/utils/team/subscriptions/create';

class CreateTeamSubscriptionController {
	async store(req: Request, res: Response): Promise<Response> {
		const schema = Yup.object().shape({
			expire_in: Yup.date().required(),
			members_limit: Yup.number().required(),
		});

		try {
			await schema.validate(req.body);
		} catch (error) {
			if (error instanceof Error) {
				return res.status(400).json({ error });
			}
		}

		const { team_id } = req.params;
		const { expire_in, members_limit } = req.body;

		const expireIn = startOfDay(parseISO(expire_in));

		const response = await createTeamSubscription({
			team_id,
			expireIn,
			membersLimit: members_limit,
		});

		return res.json(response);
	}
}

export default new CreateTeamSubscriptionController();
