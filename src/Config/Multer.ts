import { resolve } from 'path';
import multer from 'multer';

const path = resolve(__dirname, '..', '..', 'temp');

export const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path);
    },
    filename: (req, file, cb) => {
        const [_, ext] = file.originalname.split('.');

        cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
    },
});
