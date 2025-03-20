import fs from 'node:fs';
import Firebase from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';

async function importProducts(path: string): Promise<void> {
	try {
		if (!fs.existsSync(path)) {
			console.error(`Arquivo ${path} não encontrado.`);
			return;
		}

		// Lê e faz o parse do arquivo JSON
		const fileContent = fs.readFileSync(path, 'utf-8');
		const products = JSON.parse(fileContent);

		if (!Array.isArray(products)) {
			console.error(
				'Formato do arquivo inválido. Esperado um array de produtos.'
			);
			return;
		}

		console.log(
			`Iniciando a importação de ${products.length} produtos para o Firestore...`
		);

		const BATCH_LIMIT = 500;
		let batchCount = 0;
		let productCount = 0;

		const firestore = Firebase.firestore(firebaseAppExpiryChecker);

		// Processa os produtos em batches de 500
		for (let i = 0; i < products.length; i += BATCH_LIMIT) {
			const batch = firestore.batch();
			const subBatch = products.slice(i, i + BATCH_LIMIT);

			interface IProductImport {
				name: string;
				code: string;
				brand: string | null;
				image: string | null;
			}

			subBatch.forEach((product: IProductImport) => {
				// Utiliza o campo "code" como ID do documento na coleção "products"
				const docRef = firestore
					.collection('products')
					.doc(product.code);
				// Usa o método set para criar o documento com os dados do produto
				batch.set(
					docRef,
					{
						name: product.name,
						brand: product.brand || null,
						image: product.image || null,
					},
					{ merge: false }
				);
			});

			await batch.commit();
			productCount += subBatch.length;
			batchCount++;
			console.log(
				`Batch ${batchCount} com ${subBatch.length} produtos importado.`
			);
		}

		console.log(
			`Importação concluída. Total de produtos importados: ${productCount}`
		);
	} catch (error) {
		console.error('Erro ao importar produtos:', error);
	}
}

export { importProducts };
