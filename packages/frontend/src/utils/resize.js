import { computed, ref } from 'vue';
import { debounce } from './utils';

const mobileStatus = mobileCheckout();
export const isMobile = ref(mobileStatus);

const base_height = 744;
const base_width = 1512;
const innerHeight = ref(window.innerHeight);
const innerWidth = ref(window.innerWidth);
const base_ratio = 744 / 1512;
const isWidescreen = computed(() => innerHeight.value / innerWidth.value < 1);
export const page_height = computed(() =>
	!isWidescreen.value
		? Math.floor(base_ratio * innerWidth.value) + 'PX'
		: '100vh'
);

export const page_ratio = ref(minRatio());

window.addEventListener('resize', debounce(resizeHandler));

function mobileCheckout() {
	let flag = navigator.userAgent.match(
		/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i
	);
	return flag || window.innerWidth < 800;
}

function resizeHandler() {
	page_ratio.value = minRatio();
	isMobile.value = mobileCheckout();
}

function minRatio() {
	const value =
		Math.min(innerHeight.value / base_height, innerWidth.value / base_width) -
		0.5;
	return isWidescreen.value && value > 1 ? value : 1;
}
