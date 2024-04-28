const { configure } = require('quasar/wrappers');

module.exports = configure(function (ctx) {
	return {
		supportTS: {
			tsCheckerConfig: {
				eslint: {
					enabled: true,
					files: './src/**/*.{ts,tsx,js,jsx,vue}'
				}
			}
		},

		preFetch: true,

		boot: ['i18n', 'axios', 'smartEnginEntrance'],

		css: ['app.scss'],

		extras: [
			'roboto-font', // optional, you are not bound to it
			'material-icons', // optional, you are not bound to it
			'bootstrap-icons',
			'themify',
			'material-icons',
			'material-symbols-outlined',
			'material-symbols-rounded'
		],

		build: {
			vueRouterMode: 'history',
			env: {
				URL: process.env.URL,
				WS_URL: process.env.WS_URL
			}
		},

		devServer: {
			open: true, // opens browser window automatically,
			proxy: {
				'/bfl': {
					target: process.env.URL,
					changeOrigin: true,
					pathRewrite: {
						'^/bfl': 'bfl'
					}
				},
				'/server': {
					target: process.env.URL,
					changeOrigin: true,
					pathRewrite: {
						'^/server': 'server'
					}
				},
				'/api': {
					target: process.env.URL,
					changeOrigin: true,
					pathRewrite: {
						'^/api': 'api'
					}
				}
			},
			port: 9000
		},

		framework: {
			config: {},
			// Quasar plugins
			plugins: ['Notify', 'Loading', 'Dialog', 'Cookies']
		},

		animations: ['fadeIn', 'fadeOut'],

		ssr: {
			pwa: false,
			prodPort: 3000, // The default port that the production server should use
			maxAge: 1000 * 60 * 60 * 24 * 30,
			middlewares: [
				ctx.prod ? 'compression' : '',
				'render' // keep this as last one
			]
		},

		pwa: {
			workboxPluginMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
			workboxOptions: {}, // only for GenerateSW

			manifest: {
				name: 'Quasar App',
				short_name: 'Quasar App',
				description: '',
				display: 'standalone',
				orientation: 'portrait',
				background_color: '#ffffff',
				theme_color: '#027be3',
				icons: [
					{
						src: 'icons/favicon.ico',
						sizes: '128x128',
						type: 'image/png'
					}
				]
			}
		},

		// Full list of options: https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
		capacitor: {
			hideSplashscreen: true
		}
	};
});
