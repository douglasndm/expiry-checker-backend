import axios from 'axios';

import AppError from '@errors/AppError';

const baseUrl = 'https://gtin.rscsistemas.com.br';

let token: string | null = null;
let tokenExpiresAt: number | null = null;

const api = axios.create({
	baseURL: baseUrl,
	headers: {
		'Content-Type': 'application/json',
	},
});

async function fetchToken(): Promise<string> {
	interface Response {
		token: string;
	}

	const response = await axios.post<Response>(
		'https://gtin.rscsistemas.com.br/oauth/token',
		{},
		{
			auth: {
				username: String(process.env.GTIN_USER),
				password: String(process.env.GTIN_PASS),
			},
		}
	);

	token = response.data.token;
	tokenExpiresAt = Date.now() + 3600000;
	return response.data.token;
}

function isTokenValid() {
	return token && tokenExpiresAt && Date.now() < tokenExpiresAt;
}

async function getToken() {
	if (!isTokenValid()) {
		await fetchToken();
	}
	return token;
}

// Interceptor para adicionar o token no header Authorization em cada requisição
api.interceptors.request.use(
	async config => {
		const currentToken = await getToken();
		config.headers['Authorization'] = `Bearer ${currentToken}`;
		return config;
	},
	error => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação (por exemplo, token expirado)
api.interceptors.response.use(
	response => response,
	async error => {
		if (error.response && error.response.status === 404) {
			return Promise.reject(
				new AppError({
					statusCode: error.response.status,
					message: 'Produto não encontrado',
				})
			);
		}

		// Se a requisição retornar 401, tenta atualizar o token e refaz a requisição
		if (error.response && error.response.status === 401) {
			console.log('Token expirado, atualizando token...');
			await fetchToken();
			error.config.headers['Authorization'] = `Bearer ${token}`;
			return axios.request(error.config);
		}
		return Promise.reject(error);
	}
);

export default api;
