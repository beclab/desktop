<template>
	<div class="searchCard">
		<img
			class="cursor-pointer"
			src="app-icon/text-back.svg"
			alt="delete"
			@click="goBack"
		/>
		<div class="appIcon q-ml-sm">
			<img class="icon" :src="item?.icon" alt="search" />
			<span class="q-ml-sm">{{ item?.name }}</span>
		</div>
		<input
			class="input text-ink-1"
			type="text"
			ref="filesRef"
			v-model.trim="searchFiles"
			placeholder="Search files..."
		/>
		<q-icon
			v-if="searchFiles"
			class="cursor-pointer"
			name="sym_r_close"
			size="24px"
			style="color: #adadad"
			@click="handleClear"
		/>
	</div>
	<div class="files">
		<div class="fileDetails q-pa-md" v-if="filedata && filedata.length > 0">
			<div
				class="fileItem q-pa-sm q-mb-xs"
				:class="activeItem === file.id ? 'active' : ''"
				v-for="file in filedata"
				:key="file.id"
			>
				<div class="item-icon">
					<img
						v-if="item?.name === 'Wise' && file.meta?.image_url"
						class="icon"
						:src="
							file.meta?.image_url
								? file.meta?.image_url
								: './../../assets/search-wise-default.png'
						"
						alt="file"
					/>

					<img
						v-else-if="item?.name === 'Wise' && !file.meta?.image_url"
						class="icon"
						style="width: 48px; height: 48px"
						src="./../../assets/search-wise-default.png"
						alt="file"
					/>

					<img
						v-else
						class="icon"
						:src="`/files/file-${file.fileType}.svg`"
						alt="file"
					/>
				</div>
				<div class="item-content q-mx-md">
					<div
						class="title"
						v-if="file.highlight_field === 'title'"
						v-html="file.highlight"
					></div>
					<div class="title" v-else>{{ file.title }}</div>

					<div class="desc q-my-xs" v-if="item?.name === 'Wise'">
						<span v-if="file.meta && file.meta.created_at">
							Published at:
							{{
								date.formatDate(file.meta.created_at, 'MMM Do YYYY, HH:mm:ss')
							}}
						</span>
						<span v-if="file.feed_title || file.author"
							>{{ file.feed_title }} &nbsp;&nbsp; {{ file.author }}</span
						>
						<!-- <span>{{ file.path }}</span> -->
					</div>

					<div class="desc q-my-xs" v-else>
						<span>Owner: {{ file.owner_userid }}</span>
						<span
							>Modified:
							{{
								date.formatDate(
									file.meta.updated * 1000,
									'MMM Do YYYY, HH:mm:ss'
								)
							}}
						</span>
						<span>{{ file.path }}</span>
					</div>

					<div
						class="context"
						v-if="file.highlight_field === 'content'"
						v-html="file.highlight"
					></div>
					<!-- <div class="context" v-else>{{ item.content }}</div> -->
				</div>
				<div class="item-search">
					<q-icon
						v-if="file?.name === 'Wise'"
						class="icon cursor-pointer"
						name="sym_r_share_windows"
						size="20px"
						@click="open(file)"
					/>
					<q-icon
						v-else
						class="icon cursor-pointer"
						name="sym_r_search"
						size="20px"
						@click="open(file)"
					/>
				</div>
			</div>
		</div>
		<div v-else class="nodata column items-center justify-center">
			<img class="icon" src="./../../assets/nodata.svg" alt="nodata" />
			<div class="text-grey-8">No Matching Result Found</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { debounce, date } from 'quasar';
import { useSearchStore } from './../../stores/search';

const props = defineProps({
	showSearchDialog: {
		type: Boolean,
		require: false,
		default: false
	},
	handSearchFiles: {
		type: String,
		require: false
	},
	item: {
		type: Object,
		require: false
	},
	commandList: {
		type: Object,
		require: false
	}
});

const emits = defineEmits(['goBack', 'openCommand']);

const searchFiles = ref('');
const filesRef = ref();

const filedata = ref();
const activeItem = ref();
const isActiveRef = ref();
const searchStore = useSearchStore();
const pattern = new RegExp('[\u4E00-\u9FA5]+');

const chooseFile = (index: number) => {
	activeItem.value = filedata.value[index].id;
};

const refushScroll = (index: number) => {
	isActiveRef.value[index].scrollIntoView({
		behavior: 'auto',
		block: 'nearest'
	});
};

watch(
	() => searchFiles.value,
	debounce(async (newVal: string | undefined) => {
		if (!newVal) {
			return (filedata.value = []);
		}
		if (!pattern.test(newVal) && newVal.length <= 2) {
			return false;
		}

		filedata.value = await getContent(newVal);
	}, 600)
);

const getContent = (query?: string) => {
	return searchStore.getContent(query, props.item?.serviceType);
};

const goBack = () => {
	emits('goBack');
};

const keydownEnter = (event: any) => {
	if (event.keyCode === 8 && !searchFiles.value) {
		return goBack();
	}

	if (!filedata.value) return false;
	const index = filedata.value.findIndex(
		(item: { id: number }) => item.id === activeItem.value
	);
	const selectItem = filedata.value[index];
	const upIndex = index - 1;
	const downIndex = index + 1;

	switch (event.keyCode) {
		case 38:
			if (upIndex >= 0) {
				activeItem.value = filedata.value[upIndex].id;
				refushScroll(upIndex);
				chooseFile(upIndex);
			}
			break;

		case 40:
			if (downIndex <= filedata.value.length - 1) {
				activeItem.value = filedata.value[downIndex].id;
				refushScroll(downIndex);
				chooseFile(downIndex);
			}
			break;

		case 13:
			open(selectItem);
			break;
	}
};

const open = (item: any) => {
	if (props.item?.name === 'Drive') {
		const url = '/Files' + item.path;

		const filesApp = props.commandList?.find(
			(el: { appid: string }) => el.appid && el.appid === 'files'
		);

		filesApp.url = filesApp.url + url;

		emits('openCommand', filesApp);
	} else if (props.item?.name === 'Wise') {
		const filesApp = props.commandList?.find(
			(el: { appid: string }) => el.appid && el.appid === 'wise'
		);
		emits('openCommand', filesApp);
	}

	// emits('openCommand', resource_uri);
};

const handleClear = () => {
	searchFiles.value = '';
};

onMounted(async () => {
	filesRef.value && filesRef.value.focus();
	window.addEventListener('keydown', keydownEnter);
});

onUnmounted(() => {
	window.removeEventListener('keydown', keydownEnter);
});
</script>

<style>
hi {
	color: #3377ff !important;
}
</style>

<style lang="scss" scoped>
.files {
	height: calc(100% - 46px);
	border-top: 1px solid #d8d8d8;
	overflow: scroll;
	display: flex;

	.fileDetails {
		width: 100%;
		overflow: scroll;

		.fileItem {
			width: 100%;
			display: flex;
			border-radius: 8px;

			&.active {
				background-color: rgba(0, 0, 0, 0.1);
			}

			&:hover {
				background-color: rgba(0, 0, 0, 0.1);
			}

			.item-icon {
				width: 40px;
				display: flex;
				align-items: flex-start;
				justify-content: center;
			}
			.item-content {
				flex: 1;
				.title {
					color: $ink-1;
					font-size: 14px;
					font-style: normal;
					font-weight: 400;
					line-height: 20px;
				}
				.desc {
					color: $ink-3;
					font-size: 12px;
					font-style: normal;
					font-weight: 400;
					line-height: 16px;

					> span:not(:last-child) {
						padding-right: 6px;
						margin-right: 6px;
						border-right: 1px solid rgba(0, 0, 0, 0.1);
					}
				}
				.context {
					overflow: hidden;
					color: $ink-2;
					text-overflow: ellipsis;
					font-family: Roboto;
					font-size: 12px;
					font-style: normal;
					font-weight: 400;
					line-height: 16px;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					display: -webkit-box;
				}
			}
			.item-search {
				width: 40px;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}
	}

	.nodata {
		width: 100%;
	}
}
</style>
