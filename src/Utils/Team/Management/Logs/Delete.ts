import { getRepository } from 'typeorm';

import UserLogs from '@models/UserLogs';

async function deleteAllLogsFromTeam(team_id: string): Promise<void> {
    const repository = getRepository(UserLogs);
    const logs = await repository
        .createQueryBuilder('logs')
        .leftJoinAndSelect('logs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await repository.remove(logs);
}

export { deleteAllLogsFromTeam };
