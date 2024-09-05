<template>
	<router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useTokenStore } from './stores/token';
import { useSocketStore } from './stores/websocketStore';
import axios from 'axios';
import { WebPlatform } from './utils/platform';
import { supportLanguages } from './i18n';
import { i18n } from './boot/i18n';

const platform = new WebPlatform();

export default defineComponent({
	name: 'App',
	async preFetch(): Promise<any> {
		const tokenStore = useTokenStore();
		const host = window.location.origin;
		tokenStore.setUrl(host);

		if (document.getElementById('Loading'))
			document.getElementById('Loading')?.remove();

		return tokenStore.loadData().then(async () => {
			platform.getDeviceInfo().then((deviceInfo) => {
				if (tokenStore.id) {
					deviceInfo.id = tokenStore.id;
					try {
						axios.post('/api/device', deviceInfo);
					} catch (e) {
						console.log(e);
					}
				}
			});
		});
	},
	setup() {
		const tokenStore = useTokenStore();

		onMounted(async () => {
			const href = window.location.href;

			if (href.indexOf('desktop.local.') <= -1) {
				const authIndex = href.indexOf('desktop.');
				const pingLocalUrl =
					href.slice(0, authIndex + 8) + 'local.' + href.slice(authIndex + 8);
				const data = await tokenStore.pingLoadData(pingLocalUrl);
				if (data) {
					window.location.replace(pingLocalUrl);
				}
			}

			setInterval(async () => {
				tokenStore.refresh_token();
			}, 1000 * 3600);

			const websocketStore = useSocketStore();
			websocketStore.start();
		});

		let terminusLanguage = '';
		let terminusLanguageInfo: any = document.querySelector(
			'meta[name="terminus-language"]'
		);
		if (terminusLanguageInfo && terminusLanguageInfo.content) {
			terminusLanguage = terminusLanguageInfo.content;
		} else {
			terminusLanguage = navigator.language;
		}

		console.log(navigator.language);

		if (terminusLanguage) {
			if (supportLanguages.find((e) => e.value == terminusLanguage)) {
				i18n.global.locale.value = terminusLanguage as any;
			}
		}

		return {};
	}
});
</script>
