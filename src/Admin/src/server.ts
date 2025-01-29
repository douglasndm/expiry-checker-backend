import App from './app';

const { ADMIN_PORT } = process.env;

App.listen(Number(ADMIN_PORT), '0.0.0.0', () => {
	console.log(`Server is running at http://localhost:${ADMIN_PORT} 🌐`);
});
