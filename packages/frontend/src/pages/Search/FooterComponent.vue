<template>
	<div class="search-footer q-pl-lg">
		<div>
			<q-btn
				class="btn-size-xs btn-no-text q-mr-xs bg-grey-2"
				icon="sym_r_swap_vert"
				text-color="ink-2"
			>
			</q-btn>
			<span class="q-ml-md">{{ t('navigate') }}</span>
		</div>

		<div class="separator"></div>

		<div>
			<q-btn
				class="btn-size-xs btn-no-text q-mr-xs bg-grey-2"
				icon="sym_r_keyboard_return"
				text-color="ink-2"
			>
			</q-btn>
			<span class="q-ml-md">{{ t('select') }}</span>
		</div>

		<div class="separator"></div>

		<div class="row items-center justify-center">
			<div class="esc">
				<img src="./../../assets/esc.svg" alt="esc" />
			</div>
			<span class="q-ml-md">{{ t('quit') }}</span>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
</script>

<style lang="scss" scoped>
.search-footer {
	width: 100%;
	height: 48px;
	display: flex;
	align-items: center;
	border-top: 1px solid rgba(0, 0, 0, 0.1);
	span {
		color: #adadad;
	}

	.esc {
		width: 24px;
		height: 24px;
		border-radius: 4px;
		background-color: rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		justify-content: center;
		img {
			width: 16px;
			height: 16px;
		}
	}

	.separator {
		width: 1px;
		height: 20px;
		border-right: 1px solid rgba(0, 0, 0, 0.1);
		margin: 0 16px;
	}
}
</style>
