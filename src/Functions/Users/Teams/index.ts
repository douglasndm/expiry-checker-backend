import { getRepository } from 'typeorm';

import UserTeam from '@models/UserTeam';

import { deleteTeam } from '@utils/Team/Delete';

import Cache from '@services/Cache';

interface getAllTeamsUserIsProps {
    user_id: string;
}

export async function getAllTeamsUserIs({
    user_id,
}: getAllTeamsUserIsProps): Promise<Array<UserTeam>> {
    const userTeamsRepository = getRepository(UserTeam);

    const teams = await userTeamsRepository
        .createQueryBuilder('userTeams')
        .leftJoinAndSelect('userTeams.user', 'user')
        .leftJoinAndSelect('userTeams.team', 'team')
        .where('user.firebaseUid = :user_id', { user_id })
        .getMany();

    return teams;
}

interface removeUserFromAllTeamsProps {
    user_id: string;
}

export async function removeUserFromAllTeams({
    user_id,
}: removeUserFromAllTeamsProps): Promise<void> {
    const userTeamsRepository = getRepository(UserTeam);

    const teams = await getAllTeamsUserIs({ user_id });

    const managersTeams = teams.filter(
        team => team.role.toLowerCase() === 'manager',
    );
    const notManagersTeams = teams.filter(
        team => team.role.toLowerCase() !== 'manager',
    );

    // Apagar os times nos quais o usuário é o gerente
    if (managersTeams.length > 0) {
        await deleteTeam(managersTeams[0].team.id);
    }

    // Remove o usuário de todos os times dos quais ele não é gerente
    await userTeamsRepository.remove(notManagersTeams);

    const cache = new Cache();
    notManagersTeams.forEach(async role => {
        await cache.invalidade(`team_users:${role.team.id}`);
    });
}
