import { defineStore } from 'pinia';
import axios from 'axios';
import { date } from 'quasar';
import { getFileType, getFileIcon } from '@bytetrade/core';
import { useAppStore } from './app';
import { useTokenStore } from './token';
import { sizeFormat } from './../utils/utils';
import { useSocketStore } from './websocketStore';

interface ChatMsg {
	text: string;
	messageId: string;
	conversationId: string;
	model: string;
	name: string;
}

enum SearchCategory {
	Command = 'Command',
	Application = 'Application'
}

interface searchItemType {
	name: string;
	title: string;
	icon: string;
	type: SearchCategory;
	id: string;
	serviceType: ServiceType;
}

export type SearchState = {
	can_input: boolean;
	waiting: boolean;
	conversationId: string | null;
	chatList: ChatMsg[];
	searchList: searchItemType[];
};

export interface TextSearchItem {
	id: number | string;
	author?: string;
	content?: string;
	meta: any;
	highlight?: string;
	highlight_field: string;
	owner_userid?: string;
	title: string;
	resource_uri?: string;
	fileType: string;
	fileIcon: string;
	repo_id?: string;
	path: string;
	isDir: boolean;
}

export enum SecondFactorMethod {
	TOTP = 'totp',
	Webauthn = 'webauthn',
	MobilePush = 'mobilePush',
	TerminusPass = 'terminus_pass'
}

enum ServiceType {
	Files = 'files',
	Knowledge = 'knowledge',
	Sync = 'sync'
}
interface ServiceParamsType {
	query: string;
	serviceType: ServiceType;
	limit: number;
	offset: number;
	repo_id?: string;
}

const appStore = useAppStore();
const tokenStore = useTokenStore();

export const useSearchStore = defineStore('search', {
	state: () => {
		return {
			can_input: true,
			waiting: false,
			conversationId: null,
			chatList: [],
			searchList: [
				{
					name: 'Files Search',
					title: 'Drive',
					icon: './app-icon/drive.svg',
					type: 'Command',
					id: 'drive',
					serviceType: ServiceType.Files
				},
				{
					name: 'Files Search',
					title: 'Sync',
					icon: './app-icon/sync.svg',
					type: 'Command',
					id: 'sync',
					serviceType: ServiceType.Sync
				},
				// {
				// 	name: 'Google Drive',
				// 	title: 'Files Search',
				// 	icon: './app-icon/gddrive.svg',
				// 	type: 'Command',
				// 	id: 'gddrive',
				// 	serviceType: ServiceType.Sync
				// },
				// {
				// 	name: 'Dropbox',
				// 	title: 'Files Search',
				// 	icon: './app-icon/dropbox.svg',
				// 	type: 'Command',
				// 	id: 'dropbox',
				// 	serviceType: ServiceType.Sync
				// },
				{
					name: 'Wise Search',
					title: 'Wise',
					icon: './app-icon/wise.svg',
					type: 'Command',
					id: 'wise',
					serviceType: ServiceType.Knowledge
				}
			]
		} as SearchState;
	},
	getters: {},
	actions: {
		getCommand() {
			const myApps = appStore.myApps;
			const apps: any[] = [];
			myApps.map((item) => {
				if (item.id !== 'launchpad') {
					apps.push(item);
				}
			});
			const res = [...this.searchList, ...apps];
			// const res = [...apps];
			return res;
		},

		async getFiles(query = '') {
			// if (!tokenStore.token) {
			// 	return;
			// }
			const res: any = await axios.post(tokenStore.url + '/server/query', {
				query,
				limit: 50
			});
			if (typeof res === 'object' && res.length === 0) {
				return res;
			} else {
				const items = res.items;

				items.map((item: any) => {
					item.fileType = getFileType(item.name);
					item.fileIcon = getFileIcon(item.name);
					item.size = sizeFormat(item.size);
					item.created = date.formatDate(
						item.created * 1000,
						'MMM Do YYYY, HH:mm:ss'
					);
					item.modified = date.formatDate(
						item.modified * 1000,
						'MMM Do YYYY, HH:mm:ss'
					);
				});
				return items;
			}
		},

		async getContent(query = '', serviceType: ServiceType) {
			const params: ServiceParamsType = {
				query,
				serviceType: serviceType,
				limit: 50,
				offset: 0
			};

			if (serviceType === ServiceType.Sync) {
				const repo_list = await this.getSyncRepoList();
				const res = await this.fetchSyncData(params, repo_list, query);
				return res;
			} else {
				return await this.fetchData(params);
			}
		},

		async fetchData(params: ServiceParamsType) {
			const res: any = await axios.post(
				tokenStore.url + '/server/search',
				params
			);
			const newRes = [];

			for (let i = 0; i < res.length; i++) {
				const el = res[i];
				el.fileType = getFileType(el.title);
				el.fileIcon = getFileIcon(el.title);
				el.path = await this.getPath(el.resource_uri);
				newRes.push(el);
			}

			return res;
		},

		async fetchSyncData(
			params: ServiceParamsType,
			repo_list: any[],
			query: string
		) {
			const results: TextSearchItem[] = [];
			for (let j = 0; j < repo_list.length; j++) {
				const repo_item = repo_list[j];
				try {
					params.repo_id = repo_item.repo_id;
					const res: any = await axios.post(
						tokenStore.url + '/server/search',
						params
					);

					if (res && res.length > 0) {
						const resArr: TextSearchItem[] = [];
						for (let i = 0; i < res.length; i++) {
							const el = res[i];
							el.repo_id = repo_item.repo_id;
							el.repo_name = repo_item.repo_name;
							const id = `id_${j}_${i}`;
							resArr.push(this.formatSyncToSearch(id, el, query));
						}

						results.push(...resArr);
					}
				} catch (error) {
					console.log('error', error);
				}
			}
			return results;
		},

		formatSyncToSearch(id: string, data: any, query: string) {
			const lastIndex = data.path.lastIndexOf('/');
			const path = lastIndex !== -1 ? data.path.slice(0, lastIndex) : data.path;
			const name =
				lastIndex !== -1 ? data.path.slice(lastIndex + 1) : data.path;
			const fileType = getFileType(name) || 'blob';
			const fileIcon = getFileIcon(name);

			const searchRes: TextSearchItem = {
				id: id,
				highlight: name.replace(query, `<hi>${query}</hi>`),
				highlight_field: 'title',
				title: name,
				fileType: fileType,
				fileIcon: fileIcon || 'other',
				repo_id: data.repo_id,
				path: '/' + data.repo_name + path,
				meta: {
					updated: new Date(data.mtime).getTime() / 1000
				},
				isDir: data.type === 'file' ? false : true
			};
			return searchRes;
		},

		async getSyncRepoList() {
			const res: any = await axios.get(
				tokenStore.url + '/seahub/api/v2.1/repos/?type=mine'
			);
			return res.repos;
		},

		async getPath(resource_uri: string) {
			if (resource_uri.startsWith('/data')) {
				const splitUri = resource_uri.split('/');
				const indexUri = splitUri.findIndex(
					(item) => item.indexOf('pvc-') > -1
				);
				let res = '';
				for (let i = indexUri + 1; i < splitUri.length - 1; i++) {
					const el = splitUri[i];
					res += '/' + el;
				}
				return res;
			} else {
				return resource_uri;
			}
		},

		async sendChat(
			conversationId: string,
			message = '',
			path = '',
			type = 'basic'
		) {
			const qMessage = {
				text: message,
				messageId: '',
				conversationId: '',
				model: '',
				name: 'Me'
			};
			this.chatList.push(qMessage);
			this.can_input = false;
			this.waiting = true;
			this.conversationId = null;

			const store = useSocketStore();
			store.send({
				event: 'ai',
				data: {
					message,
					conversationId,
					path,
					type
				}
			});
		},

		initChat() {
			this.chatList = [];
			this.can_input = true;
			this.waiting = false;
		}
	}
});
