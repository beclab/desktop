<template>
	<q-dialog ref="dialogRef" @hide="onDialogHide" persistent class="dialog_box">
		<q-card class="dialog_card">
			<q-card-section class="row items-center">
				<q-img fit="contain" class="launch_pad_dialog" :src="launchlogoIocn" />
				<span class="q-ml-sm launch_dialog_span"
					>Are you sure you want to delete the application "{{
						launchTitle
					}}"？</span
				>
			</q-card-section>
			<q-card-actions align="right" class="launch_dialog_btn">
				<q-btn size="10px" label="Cancel" color="grey" v-close-popup no-caps />
				<q-btn
					size="10px"
					label="Delete"
					color="primary"
					v-close-popup
					no-caps
					@click="onOKClick"
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

export default {
	name: 'DeleteAppDialog',
	props: {
		launchlogoIocn: {
			type: String,
			required: false
		},
		launchTitle: {
			type: String,
			required: false
		}
	},
	defineProps: [],

	emits: [...useDialogPluginComponent.emits],

	setup() {
		const isConfirm = ref<boolean>(false);

		function openConfirm() {
			isConfirm.value = true;
		}

		const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
			useDialogPluginComponent();

		async function onOKClick() {
			onDialogOK();
		}

		return {
			dialogRef,
			isConfirm,
			onDialogHide,
			onOKClick,
			openConfirm,
			onDialogCancel
		};
	}
};
</script>

<style lang="scss" scoped>
.dialog_box {
	.dialog_card {
		width: 426px;
		min-height: 155px;
		border-radius: 8px;
	}
	.launch_dialog_span {
		width: 300px;
	}
	.launch_dialog_btn {
		position: absolute;
		bottom: 0px;
		right: 0px;
	}
	.launch_pad_dialog {
		width: 70px;
		height: 70px;
		border-radius: 16px;
	}
}
</style>
