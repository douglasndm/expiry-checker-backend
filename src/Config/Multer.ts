import { resolve } from 'path';
import multer from 'multer';

const path = resolve(__dirname, '..', '..', 'temp');

export const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path);
	},
	filename: (req, file, cb) => {
		const ext = file.originalname.split('.').pop();

		cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
	},
});
