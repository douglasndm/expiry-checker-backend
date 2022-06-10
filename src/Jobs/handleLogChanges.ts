import { getRepository } from 'typeorm';

import UserLog from '@models/UserLogs';

import { getUserById } from '@utils/User/Find';
import { getTeamById } from '@utils/Team/Find';

import { IAction, ITarget } from '@types/UserLogs';

interface logChangeProps {
    data: {
        user_id: string;
        team_id: string;
        target: ITarget;
        target_id: string;
        action: IAction;
        new_value: string;
        old_value?: string;
    };
}

async function logChange({ data }: logChangeProps): Promise<void> {
    try {
        const user = await getUserById(data.user_id);
        const team = await getTeamById(data.team_id);

        const repository = getRepository(UserLog);

        const log = new UserLog();
        log.user = user;
        log.team = team;
        log.target = ITarget[data.target];
        log.target_id = data.target_id;
        log.action = IAction[data.action];
        log.new_value = data.new_value;
        log.old_value = data.old_value;

        await repository.save(log);
    } catch (err) {
        if (err instanceof Error) {
            console.log(err.message);
        }
    }
}

export default {
    key: 'LogChange',
    handle: logChange,
};
