<template>
	<router-view />
</template>

<script lang="ts" setup>
import {
	onMounted,
	onUnmounted,
	onBeforeMount,
	onBeforeUnmount,
	ref
} from 'vue';
import axios from 'axios';
import { useTokenStore } from './stores/token';
import { useAppStore } from 'stores/app';
import { useUpgradeStore } from 'stores/upgrade';
import { useSocketStore } from './stores/websocketStore';
import { WebPlatform } from './utils/platform';
import { supportLanguages } from './i18n';
import { i18n } from './boot/i18n';
import {
	useDevice,
	onDeviceChange,
	DeviceType,
	networkMonitor
} from '@bytetrade/core';

const platform = new WebPlatform();

const appStore = useAppStore();
const tokenStore = useTokenStore();
const upgradeStore = useUpgradeStore();
const websocketStore = useSocketStore();

const { state, cleanup } = useDevice();
tokenStore.deviceInfo = state;

const host = window.location.origin;
tokenStore.setUrl(host);

onDeviceChange((state: { device: DeviceType; isVerticalScreen: boolean }) => {
	tokenStore.deviceInfo = state;
});

const preFetch = async () => {
	if (document.getElementById('Loading'))
		document.getElementById('Loading')?.remove();

	await tokenStore.loadData();
	await platform.getDeviceInfo().then((deviceInfo) => {
		if (tokenStore.id) {
			deviceInfo.id = tokenStore.id;
			try {
				axios.post('/api/device', deviceInfo);
			} catch (e) {
				console.log(e);
			}
		}
	});
};

preFetch();

const initializeApp = async (isNetworkRestored = false) => {
	if (isNetworkRestored) {
		await pingLocal();
	}
	upgradeStore.update_upgrade_state_info();
	appStore.get_my_apps_info(
		tokenStore.deviceInfo.device === DeviceType.MOBILE ? true : false
	);

	websocketStore.start();
};

const onVisibilityChange = () => {
	if (document.visibilityState === 'visible') {
		if (websocketStore.isClosed()) {
			initializeApp().catch((err) => {
				console.error('Error during app re-initialization:', err);
			});
		}
	} else {
		console.log('Page is in background');
	}
};

const pingLocal = async () => {
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
};

const initLanguage = () => {
	let terminusLanguage = '';
	let terminusLanguageInfo: any = document.querySelector(
		'meta[name="terminus-language"]'
	);
	if (terminusLanguageInfo && terminusLanguageInfo.content) {
		terminusLanguage = terminusLanguageInfo.content;
	} else {
		terminusLanguage = navigator.language;
	}

	if (terminusLanguage) {
		if (supportLanguages.find((e) => e.value == terminusLanguage)) {
			i18n.global.locale.value = terminusLanguage as any;
		}
	}
};

onBeforeMount(async () => {
	initLanguage();
	document.addEventListener('visibilitychange', onVisibilityChange);
});

onBeforeUnmount(() => {
	document.addEventListener('visibilitychange', onVisibilityChange);
});

const networkStatus = ref(true);
const refreshTimer = ref();
const customMonitor = networkMonitor(`${tokenStore.url}/server/init`, 10000);

onMounted(async () => {
	await initializeApp(true);

	customMonitor.startMonitoring(async (isOnline: boolean) => {
		if (isOnline) {
			if (!networkStatus.value) {
				await initializeApp(true);
			}
		}

		networkStatus.value = isOnline;
	});

	refreshTimer.value = setInterval(async () => {
		tokenStore.refresh_token();
	}, 1000 * 3600);

	websocketStore.start();
});

onUnmounted(() => {
	cleanup();
	customMonitor.stopMonitoring();
	clearInterval(refreshTimer.value);
});
</script>
