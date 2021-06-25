import { getRepository } from 'typeorm';
import * as Yup from 'yup';

import UserRoles from '@models/UserRoles';
import UserDevice from '@models/UserDevice';

import AppError from '@errors/AppError';

interface getAllUsersFromTeamProps {
    team_id: string;
    includeDevices?: boolean;
}

export interface UserResponse {
    id: string;
    email: string;
    role: string;
    status: string;
    device?: string | null;
}

export async function getAllUsersFromTeam({
    team_id,
    includeDevices,
}: getAllUsersFromTeamProps): Promise<UserResponse[]> {
    const schema = Yup.object().shape({
        team_id: Yup.string().required().uuid(),
    });

    try {
        await schema.validate({ team_id });
    } catch (err) {
        throw new AppError({
            message: err.message,
            statusCode: 400,
            internalErrorCode: 1,
        });
    }

    const userTeamsRepository = getRepository(UserRoles);

    const usersTeam = await userTeamsRepository
        .createQueryBuilder('usersTeam')
        .leftJoinAndSelect('usersTeam.user', 'user')
        .leftJoinAndSelect('usersTeam.team', 'team')
        .where('team.id = :team_id', { team_id })
        .getMany();

    let devices: Array<UserDevice> = [];

    if (includeDevices) {
        const devicesRepo = getRepository(UserDevice);

        const usersIds = usersTeam.map(user => user.user.firebaseUid);

        const usersDevices = await devicesRepo
            .createQueryBuilder('device')
            .leftJoinAndSelect('device.user', 'user')
            .where('device.user IN(:...usersIds)', { usersIds })
            .getMany();

        devices = usersDevices;
    }

    const users: Array<UserResponse> = usersTeam.map(u => {
        const { firebaseUid } = u.user;

        let userDevice: string | null = null;

        if (includeDevices) {
            const device = devices.find(
                d => d.user.firebaseUid === firebaseUid,
            );

            if (device) {
                userDevice = device.device_id;
            } else {
                userDevice = null;
            }
        }

        return {
            id: firebaseUid,
            email: u.user.email,
            role: u.role,
            status: u.status,
            code: u.code,
            device: userDevice,
        };
    });

    return users;
}
