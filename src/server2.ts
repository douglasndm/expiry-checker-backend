// Importando o módulo HTTP
const http = require('http');

// Definindo a porta em que o servidor irá escutar
const PORT = process.env.PORT || 3000;

// Função de callback para lidar com as requisições HTTP
const requestHandler = (request, response) => {
    // Escrevendo o cabeçalho da resposta HTTP com código 200 (OK) e tipo de conteúdo
    response.writeHead(200, { 'Content-Type': 'text/plain' });

    // Enviando a mensagem "Hello, World!" como corpo da resposta
    response.end('Hello, World!\n');
};

// Criando um servidor HTTP e passando a função de callback
const server = http.createServer(requestHandler);

// Iniciando o servidor para escutar as requisições na porta especificada
server.listen(PORT, err => {
    if (err) {
        return console.error('Erro ao iniciar o servidor:', err);
    }
    console.log(`Servidor está ouvindo em http://localhost:${PORT}`);
});
