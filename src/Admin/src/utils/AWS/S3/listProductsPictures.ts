import {
	S3Client,
	ListObjectsV2Command,
	ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { writeFileSync } from 'fs';

// Configuração do cliente S3
const s3Client = new S3Client({ region: 'us-east-1' }); // Substitua pela sua região

// Nome do bucket e prefixo (pasta) no S3
const BUCKET_NAME = 'expirychecker-contents';
const PREFIX = 'products/'; // Inclua '/' se for uma pasta

// Função para listar todos os objetos
const listAllKeys = async (
	bucketName: string,
	prefix: string
): Promise<string[]> => {
	let continuationToken: string | undefined;
	const keys: string[] = [];

	do {
		const params: ListObjectsV2CommandInput = {
			Bucket: bucketName,
			Prefix: prefix,
			ContinuationToken: continuationToken,
		};

		try {
			const data = await s3Client.send(new ListObjectsV2Command(params));
			data.Contents?.forEach(item => {
				if (item.Key) {
					keys.push(item.Key);
				}
			});
			continuationToken = data.IsTruncated
				? data.NextContinuationToken
				: undefined;
		} catch (error) {
			console.error('Erro ao listar objetos:', error);
			throw error;
		}
	} while (continuationToken);

	return keys;
};

// Função principal
const main = async () => {
	try {
		console.log('Listando arquivos, isso pode levar algum tempo...');
		const fileNames = await listAllKeys(BUCKET_NAME, PREFIX);

		// Salvar em um arquivo JSON
		writeFileSync('fileNames.json', JSON.stringify(fileNames, null, 2));
		console.log('Nomes dos arquivos salvos em fileNames.json');
	} catch (error) {
		console.error('Erro ao processar os arquivos:', error);
	}
};

// Executa a função principal
// main();
