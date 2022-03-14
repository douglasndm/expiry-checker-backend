import axios from 'axios';

const oneSignalAPI = axios.create({
    baseURL: 'https://onesignal.com/api/v1',
    headers: {
        'Content-Type': 'application/json; charset=utf-8',
        Authorization: `Basic ${process.env.ONESIGNAL_API_KEY}`,
    },
});

export default oneSignalAPI;
