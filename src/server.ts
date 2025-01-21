import './Services/Sentry';
import App from './app';

const { PORT } = process.env;

App.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running at http://localhost:${PORT} 🌐`);
});
