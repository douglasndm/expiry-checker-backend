import fs from 'node:fs';
import admin from 'firebase-admin';

import { firebaseAppExpiryChecker } from '@services/Firebase/Config';
import { captureException } from '@services/ExceptionsHandler';

const filePath = 'failedProducts.json';

interface Product {
	name: string;
	code: string;
	brand: string | null;
	image: string | null;
}
async function localSaveOnError(product: Product) {
	try {
		let dataArray: Product[] = [];

		// Verifica se o arquivo existe, caso contrário, cria um vazio
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, '[]', 'utf8');
		}

		// Lê o arquivo e converte para array
		const fileData = fs.readFileSync(filePath, 'utf8');
		if (fileData) {
			dataArray = JSON.parse(fileData);
		}

		dataArray.push(product); // Adiciona o novo dado

		// Escreve de volta no arquivo
		fs.writeFileSync(filePath, JSON.stringify(dataArray, null, 2), 'utf8');

		console.log('Dados adicionados com sucesso!');
	} catch (error) {
		console.error('Erro ao escrever no arquivo JSON:', error);

		captureException(error);
	}
}

async function saveProductOnFirestore(product: Product) {
	try {
		const firestore = admin.firestore(firebaseAppExpiryChecker);
		const productRef = firestore.collection('products').doc(product.code);

		await productRef.set({
			name: product.name,
			code: product.code,
			brand: product.brand,
			image: product.image,
		});
	} catch (error) {
		await localSaveOnError(product);

		captureException(error);
	}
}

export { saveProductOnFirestore };
