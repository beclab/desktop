<template>
	<div
		class="notification_page"
		:class="notificationStore.showNotification ? 'moveRight' : ''"
	>
		<div
			v-for="item in notificationData"
			:key="item.id"
			style="margin-bottom: 32px"
		>
			<div class="title" v-if="item.open">
				<div class="brige">{{ item.application }}</div>
				<div class="">
					<span class="cancel q-ml-sm" @click="deleteItem(item.application)">
						<span class="clearTxt">Clear All</span>
						<span class="cancel-icon">
							<q-icon class="icon" name="close" size="12px" />
						</span>
					</span>

					<span class="less" @click="toggleNotiyItem(item.application)"
						>Show less</span
					>
					<span class="less-icon">
						<q-icon class="icon" name="expand_less" size="12px" />
					</span>
				</div>
			</div>

			<div class="content" v-if="item.children.length > 1 && !item.open">
				<template v-for="(cell, inx) in item.children" :key="cell.id">
					<div
						class="notiy-item"
						v-if="inx === item.children.length - 1"
						@click="toggleNotiyItem(item.application)"
					>
						<div class="avator" v-if="cell.icon">
							<q-img
								src="./../assets/avatar.png"
								style="width: 36px; height: 36px"
							/>
						</div>
						<div class="info">
							<div class="tit">{{ cell.title }} {{ item.open }}</div>
							<div class="message">{{ cell.message }}</div>
						</div>

						<span class="removeApp" @click="deleteItem(item.application)">
							<q-icon class="icon" name="close" size="12px" />
						</span>
					</div>
					<div class="multiple-item"></div>
				</template>
			</div>

			<div class="content" v-else>
				<div class="notiy-item" v-for="cell in item.children" :key="cell.id">
					<div class="avator" v-if="cell.icon">
						<q-img
							src="./../assets/avatar.png"
							style="width: 36px; height: 36px"
						/>
					</div>
					<div class="info">
						<div class="tit">{{ cell.title }}</div>
						<div class="message">{{ cell.message }}</div>
					</div>

					<span
						class="removeApp"
						@click="deleteItem(item.application, cell.id)"
					>
						<q-icon class="icon" name="close" size="12px" />
					</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { ref, defineComponent, watch } from 'vue';
import { useNotificationStore } from '../stores/notification';

export default defineComponent({
	name: 'NotiFication',
	components: {},
	props: {},
	setup() {
		const notificationStore = useNotificationStore();
		const notificationData = ref(notificationStore.data);

		const toggleNotiyItem = (appName: string) => {
			console.log('appNameappNameappName', appName);
			for (let index = 0; index < notificationData.value.length; index++) {
				const element = notificationData.value[index];
				if (element.application === appName) {
					element.open = !element.open;
				}
			}
		};

		const deleteItem = (appName: string, itemId?: number) => {
			notificationStore.delete(appName, itemId);
			notificationData.value = notificationStore.data;
		};

		watch(
			() => notificationStore.showNotification,
			(newVal) => {
				console.log('showNotification', newVal);
			}
		);

		return {
			notificationData,
			notificationStore,
			toggleNotiyItem,
			deleteItem
		};
	}
});
</script>

<style lang="scss" scoped>
.notification_page {
	position: fixed;
	top: 0;
	right: -382px;
	z-index: 10;
	width: 360px;
	height: 100vh;
	overflow: scroll;
	padding: 32px 10px;
	transition: all 0.5s linear;
	&::-webkit-scrollbar {
		display: none;
	}
	.title {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
		.brige {
			color: #ffffff;
			font-weight: 700;
			font-size: 16px;
		}
		.less {
			display: inline-block;
			font-size: 12px;
			height: 22px;
			line-height: 22px;
			color: #5c5551;
			padding: 0 12px;
			border-radius: 12px;
			background: rgba(246, 246, 246, 0.4);
			box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.2),
				0px 0px 2px 0px rgba(0, 0, 0, 0.4);
			backdrop-filter: blur(30px);
			cursor: pointer;
			float: right;
		}
		.less-icon {
			width: 22px;
			height: 22px;
			border-radius: 11px;
			background: rgba(246, 246, 246, 0.4);
			box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.2),
				0px 0px 2px 0px rgba(0, 0, 0, 0.4);
			backdrop-filter: blur(30px);
			display: flex;
			align-items: center;
			justify-content: center;
			float: right;
			opacity: 0;
			.icon {
				color: #5c5551;
			}
		}
		.cancel {
			display: inline-block;
			height: 22px;
			line-height: 22px;
			font-size: 12px;
			color: #5c5551;
			padding: 0px 11px;
			border-radius: 11px;
			background: rgba(246, 246, 246, 0.4);
			box-shadow: 0px 0px 40px 0px rgba(0, 0, 0, 0.2),
				0px 0px 2px 0px rgba(0, 0, 0, 0.4);
			backdrop-filter: blur(30px);
			cursor: pointer;
			position: relative;
			float: right;
			.cancel-icon {
				width: 22px;
				height: 22px;
				line-height: 21px;
				text-align: center;
				display: inline-block;
				color: rgba(246, 246, 246, 0.4);
				position: absolute;
				right: 0px;
				top: 0px;
				.icon {
					color: #5c5551;
				}
			}
			.clearTxt {
				display: none;
				float: right;
				transition: all 1s ease-in-out;
			}
			&:hover {
				.clearTxt {
					display: inline-block;
				}
				.cancel-icon {
					display: none;
				}
			}
			&:hover + .less {
				display: none;
			}
			&:hover ~ .less-icon {
				opacity: 1;
			}
		}
	}

	.content {
		position: relative;
		.notiy-item {
			display: flex;
			align-items: center;
			justify-content: space-between;
			fill: rgba(246, 246, 246, 0.5);
			stroke-width: 1px;
			stroke: rgba(255, 255, 255, 0.2);
			backdrop-filter: blur(60px);
			background: linear-gradient(
					0deg,
					rgba(246, 246, 246, 0.5),
					rgba(246, 246, 246, 0.5)
				),
				linear-gradient(
					0deg,
					rgba(255, 255, 255, 0.2),
					rgba(255, 255, 255, 0.2)
				);
			padding: 12px 20px;
			border-radius: 20px;
			margin-bottom: 8px;

			.avator {
				width: 36px;
				height: 36px;
				border-radius: 8px;
				overflow: hidden;
				margin-right: 12px;
			}
			.info {
				flex: 1;
				.tit {
					color: #1f1814;
					font-size: 14px;
					font-style: normal;
					font-weight: 700;
					line-height: 20px;
				}
				.message {
					color: #1f1814;
					font-size: 12px;
					font-style: normal;
					font-weight: 400;
					line-height: 16px;
				}
			}

			.removeApp {
				position: absolute;
				top: -4px;
				left: -4px;
				display: none;
				width: 20px;
				height: 20px;
				line-height: 19px;
				text-align: center;
				border-radius: 11px;
				fill: rgba(246, 246, 246, 0.5);
				stroke-width: 1px;
				stroke: rgba(255, 255, 255, 0.2);
				backdrop-filter: blur(60px);
				background: linear-gradient(
						0deg,
						rgba(246, 246, 246, 0.5),
						rgba(246, 246, 246, 0.5)
					),
					linear-gradient(
						0deg,
						rgba(255, 255, 255, 0.2),
						rgba(255, 255, 255, 0.2)
					);
				position: absolute;
				right: -1px;
				top: -1px;
				cursor: pointer;
				.icon {
					color: #5c5551;
				}
				&:hover {
					background: rgba(230, 230, 230, 1);
				}
			}

			&:hover > .removeApp {
				display: inline-block;
			}
		}
		.multiple-item {
			width: 320px;
			height: 64px;
			fill: rgba(246, 246, 246, 0.4);
			stroke-width: 1px;
			stroke: rgba(255, 255, 255, 0.2);
			border-radius: 12px;
			overflow: hidden;
			backdrop-filter: blur(60px);
			position: absolute;
			bottom: -8px;
			left: 0;
			right: 0;
			margin: auto;
			background: rgba(198, 198, 198, 0.3);
			z-index: -1;
			&:hover > .removeApp {
				display: inline-block;
			}
		}
	}
}

.moveRight {
	right: 22px;
}
</style>
