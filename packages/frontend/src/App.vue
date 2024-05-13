<template>
	<router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useTokenStore } from './stores/token';
import { useSocketStore } from './stores/websocketStore';
import axios from 'axios';
import { WebPlatform } from './utils/platform';

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

		return {};
	}
});
</script>
