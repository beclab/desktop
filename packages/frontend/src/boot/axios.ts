import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
//import { useTokenStore } from '../stores/token';

declare module '@vue/runtime-core' {
	interface ComponentCustomProperties {
		$axios: AxiosInstance;
	}
}

const api = axios.create({ baseURL: 'https://api.example.com' });

export default boot(({ app }) => {
	app.config.globalProperties.$axios = axios;
	app.config.globalProperties.$api = api;

	app.config.globalProperties.$axios.interceptors.request.use(
		(config: AxiosRequestConfig) => {
			config.headers['Access-Control-Allow-Origin'] = '*';
			config.headers['Access-Control-Allow-Headers'] =
				'X-Requested-With,Content-Type';
			config.headers['Access-Control-Allow-Methods'] =
				'PUT,POST,GET,DELETE,OPTIONS';

			return config;
		}
	);

	app.config.globalProperties.$axios.interceptors.response.use(
		(response: AxiosResponse) => {
			const data = response.data;

			if (
				!response ||
				(response.status != 200 &&
					response.status != 201 &&
					response.status != 304) ||
				!data
			) {
				throw Error('Network error, please try again later');
			}

			if (data.code == 100001) {
				throw Error(data.message);
			}

			if (
				data == "<h1><a href='https://www.bytetradelab.io/'>Bytetrade</a></h1>"
			) {
				return data;
			}

			if (data.status) {
				if (data.status === 'OK') {
					return data.data;
				}
				throw Error(data.status);
			} else {
				if (data.code != 0) {
					throw Error(data.message);
				}

				return data.data;
			}
		}
	);
});

export { api };
