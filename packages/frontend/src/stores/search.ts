import { defineStore } from 'pinia';
import axios from 'axios';
import { date } from 'quasar';
import { useAppStore } from './app';
import { useTokenStore } from './token';
import { getFileType, sizeFormat } from './../utils/utils';
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
	waitting: boolean;
	conversationId: string | null;
	chatList: ChatMsg[];
	searchList: searchItemType[];
};

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
interface ServiceParmasType {
	query: string;
	serviceType: ServiceType;
	limit: number;
	offset: number;
}

const appStore = useAppStore();
const tokenStore = useTokenStore();

export const useSearchStore = defineStore('search', {
	state: () => {
		return {
			can_input: true,
			waitting: false,
			conversationId: null,
			chatList: [],
			searchList: [
				{
					name: 'Drive',
					title: 'Files Search',
					icon: './app-icon/drive.svg',
					type: 'Command',
					id: 'drive',
					serviceType: ServiceType.Files
				},
				{
					name: 'Sync',
					title: 'Files Search',
					icon: './app-icon/sync.svg',
					type: 'Command',
					id: 'sync',
					serviceType: ServiceType.Sync
				},
				{
					name: 'Google Drive',
					title: 'Files Search',
					icon: './app-icon/gddrive.svg',
					type: 'Command',
					id: 'gddrive',
					serviceType: ServiceType.Sync
				},
				{
					name: 'Dropbox',
					title: 'Files Search',
					icon: './app-icon/dropbox.svg',
					type: 'Command',
					id: 'dropbox',
					serviceType: ServiceType.Sync
				},
				{
					name: 'Wise',
					title: 'Wise Search',
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
			const myapps = appStore.myapps;
			const apps: any[] = [];
			myapps.map((item) => {
				if (item.id !== 'launchpad') {
					apps.push(item);
				}
			});
			const res = [...this.searchList, ...apps];
			// const res = [...apps];
			return res;
		},

		async getfiles(query = '') {
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
			const parms: ServiceParmasType = {
				query,
				serviceType: serviceType,
				limit: 50,
				offset: 0
			};
			const res: any = await axios.post(
				tokenStore.url + '/server/search',
				parms
			);
			const newRes = [];

			for (let i = 0; i < res.length; i++) {
				const el = res[i];
				el.fileType = getFileType(el.title);
				el.path = await this.getPath(el.resource_uri);
				newRes.push(el);
			}

			return res;
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
			this.waitting = true;
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
			this.waitting = false;
		}
	}
});
