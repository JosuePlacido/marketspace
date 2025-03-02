import AppError from "@utils/AppError";
import axios, { AxiosError, AxiosInstance } from "axios"; import { storageAuthTokenGet, storageAuthTokenSave } from "@storage/storageAuthToken";

type SignOut = () => void;
type PromiseType = {
	onSuccess: (token: string) => void;
	onFailure: (error: AxiosError) => void;
}

type APIInstanceProps = AxiosInstance & {
	registerInterceptTokenManager: (signOut: SignOut) => () => void;
}

const api = axios.create({
	baseURL: 'http://localhost:3333'
}) as APIInstanceProps;

let failedQueued: Array<PromiseType> = [];
let isRefreshing = false;

api.registerInterceptTokenManager = singOut => {
	const interceptTokenManager = api.interceptors.response.use((response) => response, async requestError => {
		if (requestError.response?.status === 401) {
			if (requestError.response.data?.message === 'Refresh token expirado.' || requestError.response.data?.message === 'token.invalid') {

				const { refresh_token } = await storageAuthTokenGet();

				if (!refresh_token) {
					singOut();
					return Promise.reject(requestError)
				}

				const originalRequestConfig = requestError.config;

				isRefreshing = true
				return new Promise(async (resolve, reject) => {
					try {
						const { data } = await api.post('/sessions/refresh-token', { refresh_token });
						await storageAuthTokenSave({ token: data.token, refresh_token: data.refresh_token });
						if (originalRequestConfig.data) {
							originalRequestConfig.data = JSON.parse(originalRequestConfig.data);
						}

						originalRequestConfig.headers = { 'Authorization': `Bearer ${data.token}` };
						api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

						failedQueued.forEach(request => {
							request.onSuccess(data.token);
						});

						resolve(api(originalRequestConfig));
					} catch (error: any) {
						console.error(error)
						failedQueued.forEach(request => {
							request.onFailure(error);
						})

						singOut();
						reject(error);
					} finally {
						isRefreshing = false;
						failedQueued = []
					}
				})

			}
			singOut();
		}
		if (requestError.response && requestError.response.data) {
			return Promise.reject(new AppError(requestError.response.data.message))
		} else {
			return Promise.reject(requestError)
		}
	});

	return () => {
		api.interceptors.response.eject(interceptTokenManager);
	}
}
export { api };
