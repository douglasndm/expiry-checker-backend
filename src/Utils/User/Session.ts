import { getUserByFirebaseId } from '@utils/User/Find';
import { registerDevice } from '@utils/User/Login';
import { getAllStoresFromUser } from '@utils/Stores/Users';
import { getTeamFromUser } from '@utils/User/Team';

import Store from '@models/Store';
import Team from '@models/Team';

interface Props {
    firebaseUid: string;
    firebaseToken: string;
    device_id: string;
    ip_address: string;
}

interface Response {
    id: string;
    name?: string;
    lastName?: string;
    email: string;
    role?: {
        name: string;
        status: string | null;
        code: string | null;
        team?: Team;
        store: Store | null;
    };
}

async function createSession(Props: Props): Promise<Response> {
    const { firebaseUid, firebaseToken, device_id, ip_address } = Props;

    const user = await getUserByFirebaseId(firebaseUid);

    await registerDevice({
        user_id: user.id,
        device_id: String(device_id),
        ip_address,
        firebaseToken,
    });

    const userTeam = await getTeamFromUser(user.id);

    const team = { ...userTeam };
    const { role, status, code } = team;
    let store: Store | null = null;

    const stores = await getAllStoresFromUser({ user_id: user.id });

    if (stores.length > 0) {
        store = stores[0].store;
    }

    let response: Response = {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
    };

    if (role) {
        response = {
            ...response,
            role: {
                name: role ? role.toLowerCase() : '',
                status: status ? status.toLowerCase() : null,
                code: code || null,
                team: team.team,
                store,
            },
        };
    }

    return response;
}

export { createSession };
