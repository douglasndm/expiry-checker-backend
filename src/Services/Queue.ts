import Queue from 'bull';

import { captureException } from '@services/ExceptionsHandler';

import * as Jobs from '@jobs/Index';

// Interface para tipagem das configurações da fila
interface QueueConfig {
	bull: Queue.Queue;
	name: string;
	handle: Queue.ProcessCallbackFunction<void>;
}

// Interface para dados do job
interface QueueJob<T = unknown> {
	data: T;
	attemptsMade: number;
	id: Queue.JobId;
}

// Configuração das filas com Redis
const createQueues = (): QueueConfig[] => {
	return Object.values(Jobs).map(job => ({
		bull: new Queue(job.key, {
			redis: {
				host: process.env.REDIS_HOST || 'localhost',
				port: Number(process.env.REDIS_PORT) || 6379,
				username: process.env.REDIS_USER,
				password: process.env.REDIS_PASS || undefined,
				maxRetriesPerRequest: 30,
			},
		}),
		name: job.key,
		handle: job.handle,
	}));
};

const queues: QueueConfig[] = createQueues();

// Configuração do módulo de filas
const QueueModule = {
	queues,

	/**
	 * Adiciona um novo job à fila especificada
	 * @param name Nome da fila de destino
	 * @param data Dados do job
	 * @returns Promise com o job criado
	 */
	add<T = unknown>(name: string, data: T): Promise<Queue.Job<T>> | undefined {
		const queue = this.queues.find(q => q.name === name);
		return queue?.bull.add(data);
	},

	/**
	 * Inicia o processamento de todas as filas
	 * e configura o monitoramento de erros com Sentry
	 */
	process(): void {
		this.queues.forEach(queue => {
			// Processador de jobs com captura de erros
			queue.bull.process(queue.handle);

			// Monitoramento global de erros
			queue.bull.on('failed', (job: QueueJob, err: Error) => {
				captureException(err, {
					tags: {
						queue: queue.name,
						job_id: job.id,
						environment: process.env.NODE_ENV,
					},
					extra: {
						attempts: job.attemptsMade,
						job_data: job.data,
					},
				});

				console.error(
					`[${queue.name}] Job failed:`,
					err.message,
					job.data
				);
			});

			// Opcional: Monitorar métricas de conclusão
			queue.bull.on('completed', (job: QueueJob) => {
				console.log(`[${queue.name}] Job completed:`, job.id);
			});
		});
	},
};

export default QueueModule;
