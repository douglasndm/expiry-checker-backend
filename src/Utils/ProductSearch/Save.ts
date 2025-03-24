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
	data_from?: string;
	ncm?: number;
	country?: string;
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

		console.log('Saving product: ' + product.code);
		await productRef.set({
			name: product.name,
			code: product.code,
			brand: product.brand,
			image: product.image,
			ncm: product.ncm,
			country: product.country,
			data_from: product.data_from,

			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log('Checking if product is in request list: ' + product.code);
		const prodRequestRef = firestore
			.collection('products_request')
			.doc(product.code);
		const request = await prodRequestRef.get();

		if (request.exists) {
			console.log('Deleting product from request list: ' + product.code);
			await prodRequestRef.delete();
		}
	} catch (error) {
		await localSaveOnError(product);

		captureException(error);
	}
}

export { saveProductOnFirestore };
