import App from './app';

const { PORT } = process.env;

App.listen(Number(PORT || 3000), () => {
    console.log(`Server is running at port ${PORT}`);
});
