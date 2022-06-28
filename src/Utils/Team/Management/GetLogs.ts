import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserLogs from '@models/UserLogs';

import AppError from '@errors/AppError';

interface getTeamLogsProps {
    team_id: string;
    limit?: number;
}

async function getTeamLogs({
    team_id,
    limit,
}: getTeamLogsProps): Promise<UserLogs[]> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
        limit: Yup.number(),
    });

    try {
        await schema.validate({ team_id, limit });
    } catch (err) {
        if (err instanceof Error) {
            throw new AppError({
                message: err.message,
            });
        }
    }

    const repository = getRepository(UserLogs);
    const logs = await repository
        .createQueryBuilder('logs')
        .leftJoinAndSelect('logs.team', 'team')
        .leftJoinAndSelect('logs.user', 'user')
        .leftJoinAndSelect('logs.product', 'product')
        .leftJoinAndSelect('logs.batch', 'batch')
        .leftJoinAndSelect('logs.category', 'category')
        .where('team.id = :team_id', { team_id })
        .getMany();

    return logs;
}

export { getTeamLogs };
