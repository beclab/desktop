import { defineStore } from 'pinia';
import axios from 'axios';
import { date } from 'quasar';
import { useAppStore } from './app';
import { useTokenStore } from './token';
import { getFileType, sizeFormat } from './../utils/utils';
import { useSocketStore } from './websocketStore';
// import list from './mock/list.json';

interface ChatMsg {
	text: string;
	messageId: string;
	conversationId: string;
	model: string;
	name: string;
}

export type SearchState = {
	can_input: boolean;
	waitting: boolean;
	conversationId: string | null;
	chatList: ChatMsg[];
};

const appStore = useAppStore();
const tokenStore = useTokenStore();

export const useSearchStore = defineStore('search', {
	state: () => {
		return {
			can_input: true,
			waitting: false,
			conversationId: null,
			chatList: []
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
			// const res = [...list, ...apps];
			const res = [...apps];
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
