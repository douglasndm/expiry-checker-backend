import { defaultDataSource } from '@services/TypeORM';

import UserLog from '@models/UserLogs';

import { getUserById } from '@utils/User/Find';
import { getTeamById } from '@utils/Team/Find';
import { findProductById } from '@utils/Product/Find';
import { findBatchById } from '@utils/Product/Batch/Find';

import { IAction } from '~types/UserLogs';

interface logChangeProps {
    data: {
        user_id: string;
        team_id: string;
        product_id?: string;
        batch_id?: string;
        category_id?: string;
        action: IAction;
        new_value: string;
        old_value?: string;
    };
}

async function logChange({ data }: logChangeProps): Promise<void> {
    try {
        const user = await getUserById(data.user_id);
        const team = await getTeamById(data.team_id);

        const repository = defaultDataSource.getRepository(UserLog);

        let product;
        let batch;
        let category;
        if (data.product_id) {
            product = await findProductById(data.product_id);
        }
        if (data.batch_id) {
            batch = await findBatchById(data.batch_id);
        }

        const log = new UserLog();
        log.user = user;
        log.team = team;
        log.product = product;
        log.batch = batch;
        log.category = category;
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
