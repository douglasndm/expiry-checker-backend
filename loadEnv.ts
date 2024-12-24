import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

function loadEnvFiles(files: string[]) {
    files.forEach(file => {
        const envPath = path.resolve(__dirname, file);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
        }
    });
}

console.log('Loading environment variables...');

// Carregar variáveis de ambiente de múltiplos arquivos
loadEnvFiles([
    '.env', // Caminho para o primeiro arquivo .env
    '../../.env', // Caminho para o segundo arquivo .env
]);
