<template>
	<div class="desktop-box">
		<div
			class="desktop_app_box"
			:class="{ dockAni: appStore.dockerapps.length > 0 }"
		>
			<template
				v-for="(element, index) in appStore.dockerapps"
				:key="'aood+index' + index"
			>
				<div class="launchapp column items-center">
					<img
						class="app-img"
						@click="openWindow(element)"
						:id="element.id"
						:src="element.icon"
						:style="{
							width: element.id === 'bdock:launchpad' ? '0.56rem' : '0.52rem',
							height: element.id === 'bdock:launchpad' ? '0.56rem' : '0.52rem'
						}"
					/>
					<div class="app-name q-mt-xs" v-if="element.id !== 'bdock:launchpad'">
						{{ element.title }}
					</div>
				</div>
			</template>
		</div>
	</div>
</template>
<script lang="ts" setup>
import { DockerAppInfo, AppClickInfo } from '@desktop/core/src/types';
import { useAppStore } from 'stores/app';

defineProps({
	drag_launch_app: {
		type: String,
		required: true
	}
});

const emits = defineEmits([]);

const appStore = useAppStore();

console.log('appStore.dockerapps', appStore.dockerapps);

const openWindow = async (item: DockerAppInfo) => {
	emits('appClick', {
		appid: item.id,
		data: {}
	} as AppClickInfo);
};

const getAppIndexInDock = (id: string) => {
	let index = -1;
	for (var i = 0; i < appStore.dockerapps.length; i++) {
		const draggedEl: any = document.getElementById(appStore.dockerapps[i].id);
		if (draggedEl.id == id) {
			index = i;
		}
	}
	return index;
};

const handleOpenApp = (appid: string) => {
	let rid = appid;
	if (rid.startsWith('bdock:') == false) {
		rid = 'bdock:' + rid;
	}

	let cc = getAppIndexInDock(rid);
	if (cc < 0) {
		appStore.add_app_on_docker_bottom(rid);
	} else {
		appStore.dockerapps[cc].show_dot = true;
	}
};

defineExpose({
	// handleRemoveApp,
	handleOpenApp
});
</script>

<style lang="scss" scoped>
.desktop-box {
	.desktop_app_box {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-around;
		position: fixed;
		bottom: 76px;
		left: 0;
		right: 0;
		margin: auto;
		z-index: 9;

		.launchapp {
			.app-img {
				width: 0.52rem;
				height: 0.52rem;
				border-radius: 0.14rem;
			}
			.app-name {
				width: 100%;
				height: 0.16rem;
				border-radius: 0.14rem;
				font-size: 12px;
				font-style: normal;
				font-weight: 400;
				line-height: 16px;
				color: #fff;
				text-align: center;
			}
		}
	}
}

.dockAni {
	animation: DockAni 0.5s ease-in-out;
}

@keyframes DockAni {
	from {
		bottom: 66px;
		opacity: 0;
	}
	to {
		bottom: 76px;
		opacity: 1;
	}
}
</style>
