import { defaultDataSource } from '@services/TypeORM';

import UserLogs from '@models/UserLogs';

async function deleteAllLogsFromTeam(team_id: string): Promise<void> {
    const repository = defaultDataSource.getRepository(UserLogs);
    const logs = await repository
        .createQueryBuilder('logs')
        .leftJoinAndSelect('logs.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    await repository.remove(logs);
}

export { deleteAllLogsFromTeam };
