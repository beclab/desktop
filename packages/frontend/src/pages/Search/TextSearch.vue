<template>
	<div class="searchCard">
		<img
			class="cursor-pointer"
			src="app-icon/text-back.svg"
			alt="delete"
			@click="goBack"
		/>
		<div class="appIcon">
			<img class="icon" :src="item?.icon" alt="search" />
			<span class="q-ml-sm text-ink-2 text-body3">{{ item?.title }}</span>
		</div>
		<input
			class="input text-ink-1"
			type="text"
			ref="filesRef"
			v-model.trim="searchFiles"
			:placeholder="t('search_file_placeholder')"
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
	<div class="files bg-background-2">
		<div class="fileDetails" v-if="fileData && fileData.length > 0">
			<bt-scroll-area class="full-width full-height q-pa-md">
				<div
					class="fileItem q-pa-sm q-mb-xs"
					:class="activeItem === file.id ? 'active' : ''"
					v-for="(file, index) in fileData"
					:key="file.id"
					@click="clickItem(file, index)"
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
							:src="
								!file.isDir
									? `/files/file-${file.fileIcon}.svg`
									: `/files/folder-default.svg`
							"
							alt="file"
						/>
					</div>
					<div class="item-content q-mx-md">
						<div
							class="title"
							v-if="file.highlight_field === 'title'"
							v-html="file.highlight"
						></div>
						<div class="title" v-else>
							{{ file.title }}
						</div>

						<div class="desc q-my-xs" v-if="item?.name === 'Wise'">
							<span>{{ t('file_author') }}: {{ file.author || '-' }}</span>
							<span v-if="file.meta && file.meta.published_at">
								{{ t('file_published') }}:
								{{
									date.formatDate(
										file.meta.published_at * 1000,
										'MMM Do YYYY, HH:mm:ss'
									)
								}}
							</span>

							<!-- <span>{{ file.path }}</span> -->
						</div>

						<div class="desc q-my-xs" v-else>
							<span v-if="file.owner_userid"
								>{{ t('file_owner') }}: {{ file.owner_userid }}</span
							>
							<span v-if="file.meta && file.meta.updated">
								{{ t('file_modified') }}:
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
							color="ink-2"
							@click="open(file)"
						/>
						<q-icon
							v-else
							class="icon cursor-pointer"
							name="sym_r_search"
							size="20px"
							color="ink-2"
							@click="open(file)"
						/>
					</div>
				</div>
			</bt-scroll-area>
		</div>
		<div v-else class="no_data column items-center justify-center">
			<img class="icon" src="./../../assets/nodata.svg" alt="no_data" />
			<div class="text-grey-8">{{ t('file_no_data') }}</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { debounce, date } from 'quasar';
import { useSearchStore } from './../../stores/search';
import { useI18n } from 'vue-i18n';

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

const emits = defineEmits(['goBack']);
const { t } = useI18n();
const searchFiles = ref('');
const filesRef = ref();

const fileData = ref();
const activeItem = ref();
const isActiveRef = ref();
const searchStore = useSearchStore();
const pattern = new RegExp('[\u4E00-\u9FA5]+');

const chooseFile = (index: number) => {
	activeItem.value = fileData.value[index].id;
};

const refreshScroll = (index: number) => {
	isActiveRef.value[index].scrollIntoView({
		behavior: 'auto',
		block: 'nearest'
	});
};

watch(
	() => searchFiles.value,
	debounce(async (newVal: string | undefined) => {
		if (!newVal) {
			return (fileData.value = []);
		}
		if (!pattern.test(newVal) && newVal.length <= 2) {
			return false;
		}

		fileData.value = await getContent(newVal);
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

	if (!fileData.value) return false;
	const index = fileData.value.findIndex(
		(item: { id: number }) => item.id === activeItem.value
	);
	const selectItem = fileData.value[index];
	const upIndex = index - 1;
	const downIndex = index + 1;

	switch (event.keyCode) {
		case 38:
			if (upIndex >= 0) {
				activeItem.value = fileData.value[upIndex].id;
				refreshScroll(upIndex);
				chooseFile(upIndex);
			}
			break;

		case 40:
			if (downIndex <= fileData.value.length - 1) {
				activeItem.value = fileData.value[downIndex].id;
				refreshScroll(downIndex);
				chooseFile(downIndex);
			}
			break;

		case 13:
			open(selectItem);
			break;
	}
};

const open = (item: any) => {
	const commandList = JSON.parse(JSON.stringify(props.commandList));
	if (props.item?.title === 'Drive') {
		const url = '/Files' + item.path + '/' + item.title;

		const filesApp = commandList.find(
			(el: { appid: string }) => el.appid && el.appid === 'files'
		);
		filesApp.url = filesApp.url + url;

		const openUrl = filesApp.url.startsWith('https')
			? filesApp.url
			: 'https://' + filesApp.url;

		window.open(openUrl);
	} else if (props.item?.title === 'Sync') {
		const url = `/Seahub${item.path}/${item.title}${item.isDir ? '/' : ''}?id=${
			item.repo_id
		}`;

		const filesApp = commandList.find(
			(el: { appid: string }) => el.appid && el.appid === 'files'
		);

		filesApp.url = filesApp.url + url;

		const openUrl = filesApp.url.startsWith('https')
			? filesApp.url
			: 'https://' + filesApp.url;

		window.open(openUrl);
	} else if (props.item?.title === 'Wise') {
		const filesApp = commandList.find(
			(el: { appid: string }) => el.appid && el.appid === 'wise'
		);

		filesApp.url =
			filesApp.url + '/' + item.meta.file_type + '/' + item.meta.id;

		const openUrl = filesApp.url.startsWith('https')
			? filesApp.url
			: 'https://' + filesApp.url;

		let enterUrl = new URL(openUrl);
		enterUrl.searchParams.append('preview_name', item.title);

		window.open(enterUrl);
	}

	// emits('openCommand', resource_uri);
};

const handleClear = () => {
	searchFiles.value = '';
};

const clickTimer: any = ref(null);
const clickDelay = ref(300);

const clickItem = (file: any, index: number) => {
	if (clickTimer.value) {
		clearTimeout(clickTimer.value);
		clickTimer.value = null;
		chooseFile(index);
		open(file);
	} else {
		clickTimer.value = setTimeout(() => {
			if (activeItem.value === file.id) {
				open(file);
			} else {
				chooseFile(index);
			}
			clickTimer.value = null;
		}, clickDelay.value);
	}
};

onMounted(async () => {
	filesRef.value && filesRef.value.focus();
	if (props.handSearchFiles) searchFiles.value = props.handSearchFiles;
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
	border-top: 1px solid $separator-color;
	overflow: hidden;
	display: flex;

	.fileDetails {
		width: 100%;

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
				img {
					width: 40px;
				}
			}
			.item-content {
				flex: 1;
				.title {
					width: 656px;
					color: $ink-1;
					font-size: 14px;
					font-style: normal;
					font-weight: 400;
					line-height: 20px;
					white-space: nowrap;
					overflow: hidden;
					text-overflow: ellipsis;
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

	.no_data {
		width: 100%;
	}
}
</style>
