import App from './app';

import './Services/Database';

const { PORT } = process.env;
const { HOST } = process.env;

App.listen(Number(PORT), HOST || 'localhost', () => {
    console.log('Server is running at 3213');
});
