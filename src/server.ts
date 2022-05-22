import App from './app';

const { PORT } = process.env;
const { HOST } = process.env;

App.listen(Number(PORT), HOST || 'localhost', () => {
    console.log(`Server is running at ${HOST}:${PORT}`);
});
