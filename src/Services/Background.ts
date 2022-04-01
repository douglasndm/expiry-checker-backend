import Queue from 'bull';
import * as Sentry from '@sentry/node';

import { redisOptions } from '@services/Redis';

import * as Jobs from '@jobs/Index';

const queues = Object.values(Jobs).map(job => ({
    bull: new Queue(job.key, {
        redis: redisOptions,
    }),
    name: job.key,
    handle: job.handle,
}));

export default {
    queues,
    add(name: string, data: any): Promise<void> {
        const queue = this.queues.find(q => q.name === name);

        return queue?.bull.add(data);
    },
    process(): void {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);

            queue.bull.on('failed', (job, err) => {
                console.log(`Job failed: ${queue.name}`, job.data);
                Sentry.captureException(err);
            });
        });
    },
};
