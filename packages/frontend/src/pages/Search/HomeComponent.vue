<template>
	<div class="searchCard">
		<img class="icon" src="../../assets/search-icon.svg" alt="search" />
		<input
			class="input"
			type="text"
			dense
			ref="searchRef"
			v-model.trim="searchTxt"
			placeholder="Search for apps and commands..."
		/>
		<q-icon
			v-if="searchTxt"
			class="cursor-pointer"
			name="sym_r_close"
			size="24px"
			style="color: #adadad"
			@click="handleClear"
		/>
		<!-- <span class="btn" @click="openCommand('')">Open Command</span> -->
	</div>
	<div class="list q-pt-sm" ref="listRef">
		<template v-for="items in appdata" :key="items.name">
			<div class="category" v-if="items.category === 'Use'">
				{{ `${items.category} ${searchTxt} with...` }}
			</div>
			<div class="category" v-if="items.category === 'Result'">
				{{ items.category }}
			</div>
			<template v-if="items.children">
				<div
					:class="[activeItem === item.name ? 'isActive' : '', 'item']"
					ref="isActiveRef"
					v-for="item in items.children"
					:key="item.name"
					@click="handleActive(item.name)"
					@dblclick="openCommand(item)"
				>
					<div class="txt">
						<img :src="item.icon" />
						<span class="name">{{ item.name }}</span>
						<span class="name q-ml-sm text-ink-2">{{ item.title }}</span>
						<!-- <span class="desc">{{ item.type }}</span> -->
					</div>
					<div class="desc q-mr-sm text-ink-2">
						{{ item.type }}
					</div>
				</div>
			</template>
		</template>
	</div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { SearchCategory } from '@desktop/core/src/types';

const props = defineProps({
	showSearchDialog: {
		type: Boolean,
		require: false,
		default: false
	},
	commandList: {
		type: Array,
		require: true
	}
});

const emits = defineEmits(['openCommand']);

const searchTxt = ref('');
const searchRef = ref();

const activeItem = ref();
const isActiveRef = ref();
const listRef = ref<null | HTMLElement>(null);
const appdata = ref();
const timer = ref();

const classifyData = (data: any, searchTxt?: string) => {
	const newArr: any[] = [];
	for (let i = 0; i < data.length; i++) {
		const el = data[i];

		if (searchTxt) {
			if (el.type != SearchCategory.Command) {
				if (el.title.toLowerCase().indexOf(searchTxt.toLowerCase()) === -1)
					continue;
				const resultIndex = newArr.findIndex(
					(item) => item.category === SearchCategory.Result
				);
				if (resultIndex <= -1) {
					let obj = {
						category: SearchCategory.Result,
						children: [el]
					};
					newArr.unshift(obj);
				} else {
					newArr[resultIndex].children.unshift(el);
				}
			} else {
				const commandIndex = newArr.findIndex(
					(item) => item.category === SearchCategory.Use
				);
				if (commandIndex <= -1) {
					let obj = {
						category: SearchCategory.Use,
						children: [el]
					};
					newArr.push(obj);
				} else {
					newArr[commandIndex].children.push(el);
				}
			}
		} else {
			const filterTypeIndex = newArr.findIndex(
				(item) => item.category === el.type
			);
			if (filterTypeIndex <= -1) {
				let obj = {
					category: el.type,
					children: [el]
				};
				newArr.push(obj);
			} else {
				newArr[filterTypeIndex].children.push(el);
			}
		}
	}

	activeItem.value = newArr[0]?.children[0]?.name;

	console.log('newArr', newArr);
	return newArr;
};

const openCommand = (item: any) => {
	if (timer.value) {
		clearTimeout(timer.value);
	}
	const searchFiles =
		searchTxt.value.toLowerCase() !== 'files search' ? searchTxt.value : '';
	item.searchFiles = searchFiles;
	emits('openCommand', item);
};

const handleActive = (name: string) => {
	if (timer.value) {
		clearTimeout(timer.value);
	}
	timer.value = setTimeout(() => {
		activeItem.value = name;
	}, 300);
};

const keydownEnter = (event: any) => {
	if (!appdata.value) {
		return false;
	}
	const keydownData = concatData(appdata.value);

	const index = keydownData.findIndex((item) => item.name === activeItem.value);
	if (event.keyCode === 38) {
		const upIndex = index - 1;
		if (upIndex >= 0) {
			activeItem.value = keydownData[upIndex].name;
			refushScroll(upIndex);
		}
	}

	if (event.keyCode === 40) {
		const downIndex = index + 1;
		if (downIndex <= keydownData.length - 1) {
			activeItem.value = keydownData[downIndex].name;
			refushScroll(downIndex);
		}
	}

	if (event.keyCode === 13) {
		const aItem = keydownData.find((item) => item.name === activeItem.value);
		openCommand(aItem);
	}
};

const concatData = (data: any) => {
	let newArr: any[] = [];
	for (let i = 0; i < data.length; i++) {
		const element = data[i];
		if (!element.children) continue;
		newArr = [...newArr, ...element.children];
	}
	return newArr;
};

const refushScroll = (index: number) => {
	isActiveRef.value[index].scrollIntoView({
		behavior: 'auto',
		block: 'nearest'
	});
};

const handleClear = () => {
	searchTxt.value = '';
};

watch(
	() => searchTxt.value,
	(newVal) => {
		appdata.value = classifyData(props.commandList, newVal);
	}
);

onMounted(() => {
	nextTick(() => {
		appdata.value = props.commandList && classifyData(props.commandList);
		setTimeout(() => {
			searchRef.value && searchRef.value.focus();
		}, 0);
	});

	document.addEventListener('keydown', keydownEnter);
});

onUnmounted(() => {
	document.removeEventListener('keydown', keydownEnter);
});
</script>

<style lang="scss" scoped>
.list {
	height: calc(100% - 48px);
	border-top: 1px solid #d8d8d8;
	overflow: scroll;
	.category {
		width: calc(100% - 32px);
		margin: 0 16px;
		height: 42px;
		line-height: 42px;
		padding-left: 16px;
		font-weight: 500;
		font-size: 14px;
		color: #857c77;
	}
	.item {
		width: calc(100% - 32px);
		height: 48px;
		line-height: 48px;
		border-radius: 12px;
		margin: 0 16px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		cursor: pointer;
		position: relative;
		.txt {
			display: flex;
			align-items: center;
			img {
				width: 24px;
				height: 24px;
				border: 0.6px solid #e0e0e0;
				border-radius: 4px;
				margin: 0 8px;
			}
		}
		.icon {
			margin-right: 16px;
			width: 24px;
			height: 24px;
			border-radius: 4px;
			display: flex;
			align-items: center;
			justify-content: center;
			&:hover {
				background: rgba(133, 124, 119, 0.2);
			}
		}

		&:hover {
			background: rgba(26, 19, 15, 0.06);
		}
		&.isActive {
			background: rgba(26, 19, 15, 0.06);
		}
	}
}
</style>
