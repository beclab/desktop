<template>
	<div class="upgrade">
		<div class="logo-wrap">
			<img
				src="../assets/upgrade-success.svg"
				v-if="['completed', 'not_running'].includes(upgradeStore.state)"
				alt="success"
			/>
			<img
				src="../assets/upgrade-fail.svg"
				v-else-if="upgradeStore.state === 'failed'"
				alt="fail"
			/>
			<div class="logo" v-else>
				<div class="shadow"></div>
				<img src="../assets/upgrading.svg" alt="upgrading" />
			</div>
		</div>

		<div
			class="content"
			v-if="['completed', 'not_running'].includes(upgradeStore.state)"
		>
			<div>Congratulations</div>
			<div>Update successful</div>
		</div>

		<div class="content" v-else-if="upgradeStore.state === 'failed'">
			<div>Upgrade failed</div>
			<div>Upgrade failed,please try again</div>
		</div>

		<div class="content" v-else>
			<div>Upgrading System</div>
			<div>Please wait a moment</div>
		</div>

		<div
			class="confirm"
			v-if="!['started', 'running'].includes(upgradeStore.state)"
			@click="confirm"
		>
			Confirm
		</div>
		<div class="confirm" v-else style="opacity: 0"></div>
	</div>
</template>
<script lang="ts">
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useUpgradeStore } from '../stores/upgrade';

export default defineComponent({
	name: 'UpgradeComponent',
	components: {},
	setup(props, context) {
		const upgradeStore = useUpgradeStore();
		const timer = ref();

		const confirm = () => {
			context.emit('closeUpgrade');
		};

		const getUpgradeStatus = async () => {
			await upgradeStore.update_upgrade_state_info();
			if (upgradeStore.state === 'not_running') {
				confirm();
			} else if (upgradeStore.state === 'completed') {
				clearInterval(timer.value);
			}
		};

		onMounted(() => {
			getUpgradeStatus();
			timer.value = setInterval(async () => {
				getUpgradeStatus();
			}, 10000);
		});

		onUnmounted(() => {
			clearInterval(timer.value);
		});

		return {
			upgradeStore,
			confirm
		};
	}
});
</script>

<style lang="scss" scoped>
.upgrade {
	width: 100vw;
	height: 100vh;
	z-index: 100000;
	background: rgba(0, 0, 0, 0.5);
	backdrop-filter: blur(15px);
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	.logo-wrap {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.logo {
		width: 80px;
		height: 80px;
		position: relative;
		.shadow {
			width: 100%;
			height: 100%;
			border: 4px solid transparent;
			border-top-color: #ffffff;
			box-sizing: border-box;
			border-radius: 50%;
			animation: 1.2s loaderAni linear infinite;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
			&:before {
				content: '';
				display: block;
				width: calc(100% + 2px);
				height: calc(100% + 2px);
				position: absolute;
				left: -3px;
				right: 0;
				top: 0;
				bottom: 0;
				margin: auto;
				border: 2px solid #ffffff;
				box-sizing: content-box;
				border-radius: 50%;
				opacity: 0.5;
			}

			@keyframes loaderAni {
				0% {
					transform: rotate(0deg);
				}
				100% {
					transform: rotate(360deg);
				}
			}
		}

		img {
			width: 58px;
			height: 58px;
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			margin: auto;
		}
	}

	.content {
		margin-top: 16px;
		> :first-child {
			line-height: 32px;
			font-weight: 800;
			font-size: 20px;
			line-height: 24px;
			text-align: center;
			letter-spacing: 0.02em;
			color: #ffffff;
		}
		> :last-child {
			line-height: 24px;
			font-weight: 400;
			font-size: 12px;
			line-height: 16px;
			text-align: center;
			color: #ffffff;
			margin-top: 8px;
		}
	}
	.confirm {
		font-weight: 600;
		font-size: 12px;
		line-height: 16px;
		color: #ffffff;
		padding: 8px 32px;
		background: linear-gradient(90deg, #ffa337 0%, #ef438b 100%);
		border-radius: 16px;
		margin-top: 24px;
		cursor: pointer;
	}
}
</style>
