/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxPluginMode is set to "InjectManifest"
 */

declare const self: ServiceWorkerGlobalScope &
	typeof globalThis & { skipWaiting: () => void };

import { precacheAndRoute } from 'workbox-precaching';
// import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { NetworkOnly } from 'workbox-strategies';
// 放在顶部，sw获得控制权，不然是下次打开页面获得
// clientsClaim();
// // 跳过等待
// self.skipWaiting();
// Use with precache injection
precacheAndRoute(
	self.__WB_MANIFEST.filter((entry) => {
		if (typeof entry == 'string') {
			return true;
		}
		return !entry.url.endsWith('.html');
	})
);

self.addEventListener('install', () => {
	console.log('Service Worker installing.');
});

self.addEventListener('activate', () => {
	console.log('Service Worker activating.');
});

self.addEventListener('fetch', (event) => {
	console.log('Fetching:', event);
});

// 自定义缓存策略
// 例如：网络优先策略
registerRoute(
	({ request }) => {
		console.log('Request mode:', request);
		return request.mode === 'navigate';
	}, // 这是 Workbox 推荐的检查 document 请求的方式
	new NetworkOnly({
		plugins: [
			// 你可以在这里添加其他插件，例如请求失败时的回退机制等
		]
	})
);

registerRoute(
	({ url }) => url.pathname.startsWith('/public/'),
	new NetworkOnly()
);

registerRoute(({ url }) => url.pathname.startsWith('/bg/'), new NetworkOnly());
