import { defineStore } from 'pinia';
import axios from 'axios';
import {
	AppInfo,
	DockerAppInfo,
	DesktopAppInfo,
	DesktopPosition
} from '@desktop/core/src/types';
import { TerminusApp } from '@bytetrade/core';
import { SearchCategory } from '@desktop/core/src/types';
import { useTokenStore } from './token';
import '../assets/icon/iconfont.css';

export interface Service {
	name: string;
	status: string;
	url: string;
}

export type AppState = {
	DOCKER_APP_SIZE: number;
	DOCKER_APP_GAP: number;
	DOCKER_APP_START_GAP: number;
	DOCKER_APP_END_GAP: number;

	DESKTOP_APP_SIZE: number;
	DESKTOP_APP_X_NUM: number;
	DESKTOP_APP_Y_NUM: number;
	DESKTOP_APP_X_GAP: number;
	DESKTOP_APP_Y_GAP: number;
	DOCKER_APP_START_X_GAP: number;
	DOCKER_APP_END_X_GAP: number;
	DOCKER_APP_START_Y_GAP: number;
	DOCKER_APP_END_Y_GAP: number;

	profile_id: string | undefined;

	dockerapps: DockerAppInfo[];
	launchpadapps: number[][];

	myapps: AppInfo[];
	desktopApps: DesktopAppInfo[];

	axiosAppInfo: TerminusApp[];
};

const tokenStore = useTokenStore();

export const isSystemApp = (id: string): boolean => {
	let rid = id;
	if (rid.startsWith('bdock:')) {
		rid = rid.substring(6);
	} else if (rid.startsWith('bdesk:')) {
		rid = rid.substring(6);
	}

	if (
		rid.startsWith('files') ||
		rid.startsWith('portfolio') ||
		rid.startsWith('vault') ||
		rid.startsWith('settings') ||
		rid.startsWith('appstore') ||
		rid.startsWith('console')
	) {
		return true;
	}

	return false;
};

export const useAppStore = defineStore('app', {
	state: () => {
		return {
			DOCKER_APP_SIZE: 36,
			DOCKER_APP_GAP: 10,
			DOCKER_APP_START_GAP: 12,
			DOCKER_APP_END_GAP: 12,

			DESKTOP_APP_SIZE: 70,
			DESKTOP_APP_X_NUM: 7,
			DESKTOP_APP_Y_NUM: 4,
			DESKTOP_APP_X_GAP: 120,
			DESKTOP_APP_Y_GAP: 75,
			DOCKER_APP_START_X_GAP: 160,
			DOCKER_APP_END_X_GAP: 100,
			DOCKER_APP_START_Y_GAP: 50,
			DOCKER_APP_END_Y_GAP: 100,

			profile_id: undefined,

			dockerapps: [],
			launchpadapps: [[]],
			desktopApps: [],
			myapps: [],
			axiosAppInfo: []
		} as AppState;
	},
	actions: {
		async get_my_apps_info() {
			await this.update_my_apps_info();

			const files = this.myapps.find((app) => app.id.startsWith('files'));
			const appstore = this.myapps.find((app) => app.id.startsWith('market'));
			const settings = this.myapps.find((app) => app.id.startsWith('settings'));
			const profile = this.myapps.find((app) => app.id.startsWith('profile'));
			this.profile_id = profile?.id;

			const docker_list = [files?.id, 'launchpad', appstore?.id, settings?.id];

			this.dockerapps = [];
			let index = 0;
			for (let j = 0; j < docker_list.length; ++j) {
				let fapp = this.myapps.find((app) => app.id == docker_list[j]);

				if (docker_list[j] == 'launchpad') {
					fapp = {
						id: 'launchpad',
						appid: 'launchpad',
						icon: 'https://file.bttcdn.com/appstore/launchpad/icon.png',
						name: 'Launchpad',
						title: 'Launchpad',
						target: '',
						//installed: true,
						state: 'running',
						fatherName: null,
						openMethod: 'default'
					};
				}

				if (fapp) {
					const d: DockerAppInfo = {
						id: 'bdock:' + fapp.id,
						left: 0,
						top:
							index == 0
								? this.DOCKER_APP_START_GAP
								: this.DOCKER_APP_START_GAP +
								  this.DOCKER_APP_SIZE * index +
								  this.DOCKER_APP_GAP * index,
						size: this.DOCKER_APP_SIZE,
						icon: fapp.icon,
						name: fapp.name,
						title: fapp.title,
						namespace: fapp.namespace!,
						owner: fapp.owner!,
						url: fapp.url!,
						is_temp: false,
						show_dot: false
					};
					this.dockerapps.push(d);
					index = index + 1;
				}
			}
		},

		async get_mobile_apps_info() {
			await this.update_my_apps_info();

			const files = this.myapps.find((app) => app.id.startsWith('files'));
			const settings = this.myapps.find((app) => app.id.startsWith('settings'));
			const profile = this.myapps.find((app) => app.id.startsWith('profile'));
			const wise = this.myapps.find((app) => app.id.startsWith('wise'));
			const vault = this.myapps.find((app) => app.id.startsWith('vault'));

			this.profile_id = profile?.id;

			const docker_list = [
				settings?.id,
				files?.id,
				'launchpad',
				wise?.id,
				vault?.id
			];

			this.dockerapps = [];
			let index = 0;
			for (let j = 0; j < docker_list.length; ++j) {
				let fapp = this.myapps.find((app) => app.id == docker_list[j]);

				if (docker_list[j] == 'launchpad') {
					fapp = {
						id: 'launchpad',
						appid: 'launchpad',
						icon: './app-icon/launch-icon.png',
						name: 'Launchpad',
						title: '',
						target: '',
						//installed: true,
						state: 'running',
						fatherName: null,
						openMethod: 'window'
					};
				}

				if (fapp) {
					const d: DockerAppInfo = {
						id: 'bdock:' + fapp.id,
						left: 0,
						top:
							index == 0
								? this.DOCKER_APP_START_GAP
								: this.DOCKER_APP_START_GAP +
								  this.DOCKER_APP_SIZE * index +
								  this.DOCKER_APP_GAP * index,
						size: this.DOCKER_APP_SIZE,
						icon: fapp.icon,
						name: fapp.name,
						title: fapp.title,
						namespace: fapp.namespace!,
						owner: fapp.owner!,
						url: fapp.url!,
						is_temp: false,
						show_dot: false
					};
					this.dockerapps.push(d);
					index = index + 1;
				}
			}
		},

		async update_search_result(searchTxt?: string) {
			const data: any = this.axiosAppInfo;
			const apps = [];
			for (let i = 0; i < data.length; ++i) {
				const d = data[i];

				if (
					searchTxt !== undefined &&
					d.title.toLowerCase().indexOf(searchTxt.toLowerCase()) < 0
				) {
					continue;
				}

				d.type = SearchCategory.Application;
				apps.push(d);
			}
			this.relocate_application_place(apps);
		},

		async dismiss_search_result() {
			this.relocate_application_place(this.myapps);
		},

		async update_my_apps_info() {
			// if (!tokenStore.token) {
			// 	return;
			// }
			const data: TerminusApp[] = await axios.post(
				tokenStore.url + '/server/myapps',
				{}
			);
			this.axiosAppInfo = data;

			this.myapps = [];

			for (let i = 0; i < data.length; ++i) {
				if (!data[i].entrances || data[i].entrances.length == 0) {
					this.myapps.push({
						...data[i],
						id: data[i].id,
						appid: data[i].id,
						type: SearchCategory.Application,
						fatherName: null,
						openMethod: 'default'
					});
				} else {
					for (let j = 0; j < data[i].entrances.length; ++j) {
						if (data[i].entrances[j].invisible) {
							// do nothing
						} else {
							this.myapps.push({
								...data[i],
								type: SearchCategory.Application,
								id: data[i].entrances[j].id,
								appid: data[i].id,
								name: data[i].entrances[j].name,
								title: data[i].entrances[j].title || data[i].title,
								url: data[i].entrances[j].url || data[i].url,
								icon: data[i].entrances[j].icon || data[i].icon,
								fatherName: data[i].name,
								openMethod: data[i].entrances[j].openMethod || 'default'
							});
						}
					}
				}
			}

			this.relocate_application_place(this.myapps);

			const fapp = {
				id: 'launchpad',
				appid: 'launchpad',
				icon: 'https://file.bttcdn.com/appstore/launchpad/icon.png',
				name: 'Launchpad',
				title: 'Launchpad',
				target: '',
				//installed: true,
				state: 'running',
				type: SearchCategory.Application,
				fatherName: null,
				openMethod: 'default'
			};
			this.myapps.push(fapp);
		},

		relocate_application_place(relocate_apps: AppInfo[]) {
			this.launchpadapps = [];
			this.desktopApps = [];

			const t: any = {};
			for (let i = 0; i < relocate_apps.length; ++i) {
				if (relocate_apps[i].id == 'launchpad') {
					continue;
				}
				t[relocate_apps[i].id] = '1';

				if (i % (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM) == 0) {
					this.launchpadapps.push([]);
				}

				const page_num = i % (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM);
				const y = Math.floor(page_num / this.DESKTOP_APP_X_NUM);
				const x = page_num - y * this.DESKTOP_APP_X_NUM;

				const d: DesktopAppInfo = {
					id: 'bdesk:' + relocate_apps[i].id,
					appid: 'bdesk:' + relocate_apps[i].appid,
					index: i,
					page: this.launchpadapps.length - 1,
					page_num: page_num,
					left:
						x == 0
							? this.DOCKER_APP_START_X_GAP
							: this.DOCKER_APP_START_X_GAP +
							  this.DESKTOP_APP_SIZE * x +
							  this.DESKTOP_APP_X_GAP * x,
					top:
						y == 0
							? this.DOCKER_APP_START_Y_GAP
							: this.DOCKER_APP_START_Y_GAP +
							  this.DESKTOP_APP_SIZE * y +
							  this.DESKTOP_APP_Y_GAP * y,
					size: this.DESKTOP_APP_SIZE,
					icon: relocate_apps[i].icon,
					name: relocate_apps[i].name,
					title: relocate_apps[i].title,
					state: relocate_apps[i].state,
					namespace: '',
					owner: '',
					url: '',
					fatherName: relocate_apps[i].fatherName
				};

				this.launchpadapps[this.launchpadapps.length - 1].push(i);
				this.desktopApps.push(d);
			}
		},

		resize() {
			for (let i = 0; i < this.desktopApps.length; ++i) {
				const y = Math.floor(
					this.desktopApps[i].page_num / this.DESKTOP_APP_X_NUM
				);
				const x = this.desktopApps[i].page_num - y * this.DESKTOP_APP_X_NUM;
				this.desktopApps[i].left =
					x == 0
						? this.DOCKER_APP_START_X_GAP
						: this.DOCKER_APP_START_X_GAP +
						  this.DESKTOP_APP_SIZE * x +
						  this.DESKTOP_APP_X_GAP * x;
				this.desktopApps[i].top =
					y == 0
						? this.DOCKER_APP_START_Y_GAP
						: this.DOCKER_APP_START_Y_GAP +
						  this.DESKTOP_APP_SIZE * y +
						  this.DESKTOP_APP_Y_GAP * y;
			}
		},

		get_desktop_position(index: number) {
			const page = Math.floor(
				index / (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM)
			);
			const page_num =
				index % (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM);
			const y = Math.floor(page_num / this.DESKTOP_APP_X_NUM);
			const x = page_num - y * this.DESKTOP_APP_X_NUM;
			const p: DesktopPosition = {
				index: index,
				page: page,
				page_num: page_num,
				left:
					x == 0
						? this.DOCKER_APP_START_X_GAP
						: this.DOCKER_APP_START_X_GAP +
						  this.DESKTOP_APP_SIZE * x +
						  this.DESKTOP_APP_X_GAP * x,
				top:
					y == 0
						? this.DOCKER_APP_START_Y_GAP
						: this.DOCKER_APP_START_Y_GAP +
						  this.DESKTOP_APP_SIZE * y +
						  this.DESKTOP_APP_Y_GAP * y
			};
			return p;
		},

		find_app(id: string) {
			return this.dockerapps.find((app) => app.id == id);
		},

		async remove_app_on_docker(id: string) {
			const index: number = this.dockerapps.findIndex((app) => app.id == id);

			if (index >= 0) {
				this.dockerapps.splice(index, 1);
			}
		},

		is_app_in_docker(id: string) {
			let rid = id;
			if (rid.startsWith('bdesk:')) {
				rid = rid.substring(6);
				rid = 'bdock:' + id;
			} else if (rid.startsWith('bdock:') == false) {
				rid = 'bdock:' + id;
			}
			const t = this.dockerapps.find((app) => app.id == rid);
			return t != undefined;
		},

		async add_app_on_docker_bottom(id: string) {
			const index = this.dockerapps.length;
			const top =
				index == 0
					? this.DOCKER_APP_START_GAP
					: this.DOCKER_APP_START_GAP +
					  this.DOCKER_APP_SIZE * index +
					  this.DOCKER_APP_GAP * index;
			this.add_app_on_docker(id, top, true, true);
		},

		async add_app_on_docker(
			id: string,
			top: number,
			is_temp: boolean,
			show_dot: boolean
		) {
			let rid = id;
			if (rid.startsWith('bdock:')) {
				rid = rid.substring(6);
			} else if (rid.startsWith('bdesk:')) {
				rid = rid.substring(6);
			}

			const a: any = this.myapps.find((app) => app.id == rid);

			if (a) {
				const d: DockerAppInfo = {
					id: 'bdock:' + a.id,
					left: 0,
					top: top,
					size: this.DOCKER_APP_SIZE,
					icon: a.icon,
					name: a.name,
					title: a.title,
					namespace: a.namespace,
					owner: a.owner,
					url: a.url,
					is_temp,
					show_dot
				};
				this.dockerapps.push(d);
			} else {
				const d: DockerAppInfo = {
					id: 'bdock:' + a.id,
					left: 0,
					top: top,
					size: this.DOCKER_APP_SIZE,
					icon: a.icon,
					name: a.name,
					title: a.title,
					namespace: a.namespace,
					owner: a.owner,
					url: a.url,
					is_temp,
					show_dot
				};
				this.dockerapps.push(d);
			}
		},

		async uninstall_application(app_name: string | null) {
			if (!app_name) {
				return;
			}
			const data: any = await axios.get(
				tokenStore.url + '/server/uninstall/' + app_name,
				{}
			);
			console.log(data);
		}
	}
});
