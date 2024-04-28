<template>
	<router-view />
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useTokenStore } from './stores/token';
import { useSocketStore } from './stores/websocketStore';
import { initPing } from '@bytetrade/core';
import axios from 'axios';
import { WebPlatform } from './utils/platform';

const platform = new WebPlatform();

export default defineComponent({
	name: 'App',
	async preFetch(): Promise<any> {
		const tokenStore = useTokenStore();
		const host = window.location.origin;
		tokenStore.setUrl(host);

		let hrefSplit = window.location.href.split('.');
		if (hrefSplit) {
			let myTerminusIndex = hrefSplit.findIndex(
				(item) => item === 'myterminus'
			);
			let did = hrefSplit[myTerminusIndex - 1];

			if (did && did !== 'auth') {
				const local = await initPing(did);
				let localIndex = hrefSplit.findIndex((item) => item === 'local');
				if (local) {
					if (localIndex <= -1) {
						hrefSplit.splice(1, 0, 'local');
						const local_url = hrefSplit.join('.');
						window.location.replace(local_url);
						return false;
					}
				}
			}
		}

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
		const host = window.location.origin;
		tokenStore.setUrl(host);

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
