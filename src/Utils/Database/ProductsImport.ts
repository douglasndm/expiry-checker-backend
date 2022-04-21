import fs from 'fs';
import path from 'path';
import StreamArray from 'stream-json/streamers/StreamArray';
import { Writable } from 'stream';

import { addProductIfNotExists } from './Helper';

async function copyProductsToDatabase(): Promise<void> {
    const jsonPath = path.resolve(__dirname, './products.json');

    const fileStream = fs.createReadStream(jsonPath);
    const jsonStream = StreamArray.withParser();
    const processingStream = new Writable({
        write({ key, value }, encoding, callback) {
            // some async operations
            setTimeout(async () => {
                await addProductIfNotExists(value);

                // console.log(key, value);

                // console.log(`${value.codbar} copied`);
                // Runs one at a time, need to use a callback for that part to work
                callback();
            }, 50);
        },
        // Don't skip this, as we need to operate with objects, not buffers
        objectMode: true,
    });
    // Pipe the streams as follows
    fileStream.pipe(jsonStream.input);
    jsonStream.pipe(processingStream);
    // So we're waiting for the 'finish' event when everything is done.
    processingStream.on('finish', () =>
        console.log('All products were copied'),
    );
}

export { copyProductsToDatabase };
