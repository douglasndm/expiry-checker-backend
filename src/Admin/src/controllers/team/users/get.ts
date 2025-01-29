import { Request, Response } from 'express';

import { getAllUsersInTeam } from '@admin/utils/team/users/get';

class GetTeamController {
	async index(req: Request, res: Response): Promise<Response> {
		const { team_id } = req.params;

		const team = await getAllUsersInTeam(team_id);

		return res.json(team);
	}
}

export default new GetTeamController();
