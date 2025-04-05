import {
	getProductRequest,
	removeProductRequest,
} from '@utils/ProductsSuggestions/Request';
import { updateProductRequest } from '@utils/ProductsSuggestions/Request';
import { saveProductOnFirestore } from '@utils/ProductSearch/Save';

interface Props {
	data: { response: findProductByEANExternalResponse | null; code: string };
}

async function handleAfterProductSearch({ data }: Props): Promise<void> {
	const { response } = data;

	// remove everything that is not number from code
	const code = data.code.replace(/[^0-9]/g, '');

	const request = await getProductRequest(code);

	// Check if product is already on request table and add 1 to rank if
	// we didn't find a response this time
	if (request) {
		if (response !== null) {
			await removeProductRequest(request.code);
		} else {
			await updateProductRequest({
				code: request.code,
				rank: request.rank + 1,
			});
		}
	} else if (!response) {
		if (code.trim().length >= 8) {
			await updateProductRequest({
				code: code.trim(),
				rank: 1,
				notFound: true,

				createdAt: new Date(),
				updatedAt: new Date(),
			});
		}
	} else if (response) {
		await saveProductOnFirestore({
			name: response.name,
			code: response.code,
			brand: response.brand || null,
			image: response.thumbnail,
		});
	}
}

export default {
	key: 'HandleAfterProductSearch',
	handle: handleAfterProductSearch,
};
