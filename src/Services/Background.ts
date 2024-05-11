import Queue from 'bull';

import { captureException } from '@services/ExceptionsHandler';

import * as Jobs from '@jobs/Index';

const queues = Object.values(Jobs).map(job => ({
    bull: new Queue(job.key, {
        redis: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            password: process.env.REDIS_PASS || undefined,

            maxRetriesPerRequest: 30,
        },
    }),
    name: job.key,
    handle: job.handle,
}));

export default {
    queues,
    add(name: string, data: any): Promise<Queue.Job<any>> | undefined {
        const queue = this.queues.find(q => q.name === name);

        return queue?.bull.add(data);
    },
    process(): void {
        return this.queues.forEach(queue => {
            queue.bull.process(queue.handle);

            queue.bull.on('failed', (job, err) => {
                console.log(`Job failed: ${queue.name}`, job.data);
                captureException(err);
            });
        });
    },
};
