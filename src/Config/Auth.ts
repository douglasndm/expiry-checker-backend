const dotenv = require('dotenv');

dotenv.config();

export default {
    secret: process.env.APPLICATION_SECRET,
    expiresIn: '1d',
};
