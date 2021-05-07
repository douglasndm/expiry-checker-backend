import { Request, Response } from 'express';
import * as Yup from 'yup';

import { getAllUsersByTeam } from '../../Functions/Teams';

class TeamUsersController {
    async index(req: Request, res: Response): Promise<Response> {
        const schema = Yup.object().shape({
            id: Yup.string().required().uuid(),
        });

        if (!(await schema.isValid(req.params))) {
            return res.status(400).json({ error: 'Validation fails' });
        }

        try {
            const { id } = req.params;

            const usersInTeam = await getAllUsersByTeam({ team_id: id });

            const isUserInTeam = usersInTeam.filter(
                user => user.id === req.userId,
            );

            if (isUserInTeam.length <= 0) {
                return res
                    .status(401)
                    .json({ error: 'You dont have permission to be here' });
            }

            return res.status(200).json(usersInTeam);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }
}

export default new TeamUsersController();
