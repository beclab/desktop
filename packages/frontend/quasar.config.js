const { configure } = require('quasar/wrappers');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

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

		css: [
			'app.scss',
			'fonts.scss',
			ctx.dev ? 'font.dev.scss' : 'font.pro.scss'
		],

		extras: [
			'roboto-font', // optional, you are not bound to it
			'material-icons' // optional, you are not bound to it
		],

		vendor: {
			remove: ['@bytetrade/ui']
		},

		build: {
			vueRouterMode: 'history',
			gzip: true,
			// analyze: true,
			extractCSS: true,
			sourceMap: true,
			env: {
				URL: process.env.URL,
				WS_URL: process.env.WS_URL,
				CACHE_CONTROL: 'max-age=31536000, public',
				EXPIRES: 'Wed, 01 Jan 2025 00:00:00 GMT'
			},

			chainWebpack(chain, { isClient, isServer }) {
				if (isClient) {
					chain.plugin('css-minimizer-webpack-plugin').use(CssMinimizerPlugin, [
						{
							parallel: true,
							minimizerOptions: {
								preset: [
									'default',
									{
										mergeLonghand: true,
										cssDeclarationSorter: 'concentric',
										discardComments: { removeAll: true }
									}
								]
							}
						}
					]);

					chain.optimization.minimizer('terser').use(TerserPlugin, [
						{
							terserOptions: {
								parallel: true,
								sourceMap: true,
								extractComments: false,
								compress: {
									drop_console: true,
									drop_debugger: true,
									pure_funcs: ['console.log']
								},
								output: {
									comments: false,
									ascii_only: true
								}
							}
						}
					]);

					chain.optimization.splitChunks({
						chunks: 'all', // The type of chunk that requires code segmentation
						minSize: 20000, // Minimum split file size
						minRemainingSize: 0, // Minimum remaining file size after segmentation
						minChunks: 1, // The number of times it has been referenced before it is split
						maxAsyncRequests: 30, // Maximum number of asynchronous requests
						maxInitialRequests: 30, // Maximum number of initialization requests
						enforceSizeThreshold: 50000,
						cacheGroups: {
							// Cache Group configuration
							defaultVendors: {
								test: /[\\/]node_modules[\\/]/,
								priority: -10,
								reuseExistingChunk: true
							},
							default: {
								minChunks: 2,
								priority: -20,
								reuseExistingChunk: true //	Reuse the chunk that has been split
							}
						}
					});
				}
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
			workboxPluginMode: 'InjectManifest', // 'GenerateSW' or 'InjectManifest'
			workboxOptions: {}, // only for GenerateSW

			manifest: {
				name: 'Terminus',
				short_name: 'Desktop',
				description: 'Terminus OS Launcher',
				display: 'standalone',
				orientation: 'portrait',
				theme_color: 'transparent',
				icons: [
					{
						src: 'icons/icon-128x128.png',
						sizes: '128x128',
						type: 'image/png'
					},
					{
						src: 'icons/icon-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: 'icons/icon-256x256.png',
						sizes: '256x256',
						type: 'image/png'
					},
					{
						src: 'icons/icon-384x384.png',
						sizes: '384x384',
						type: 'image/png'
					},
					{
						src: 'icons/icon-512x512.png',
						sizes: '512x512',
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
