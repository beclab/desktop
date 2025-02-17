import { defineStore } from 'pinia';
import axios from 'axios';
import {
	AppInfo,
	DockerAppInfo,
	DesktopAppInfo,
	DesktopPosition,
	SearchCategory
} from '@desktop/core/src/types';
import { TerminusApp } from '@bytetrade/core';
import { useTokenStore } from './token';
import '../assets/icon/iconfont.css';
import { dockerAppsDefault } from 'src/utils/constants';

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

	dockerApps: DockerAppInfo[];
	launchPadApps: number[][];

	myApps: AppInfo[];
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
		rid.startsWith('console') ||
		rid.startsWith('market') ||
		rid.startsWith('profile') ||
		rid.startsWith('dashboard') ||
		rid.startsWith('wise') ||
		rid.startsWith('control-hub')
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

			dockerApps: dockerAppsDefault,
			launchPadApps: [[]],
			desktopApps: [],
			myApps: [],
			axiosAppInfo: []
		} as AppState;
	},
	actions: {
		async get_my_apps_info() {
			await this.update_my_apps_info();

			const files = this.myApps.find((app) => app.id.startsWith('files'));
			const appStore = this.myApps.find((app) => app.id.startsWith('market'));
			const settings = this.myApps.find((app) => app.id.startsWith('settings'));
			const profile = this.myApps.find((app) => app.id.startsWith('profile'));
			this.profile_id = profile?.id;

			const docker_list = [files?.id, 'launchpad', appStore?.id, settings?.id];

			this.dockerApps = [];
			let index = 0;
			for (let j = 0; j < docker_list.length; ++j) {
				let curApp = this.myApps.find((app) => app.id == docker_list[j]);

				if (docker_list[j] == 'launchpad') {
					curApp = {
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

				if (curApp) {
					const d: DockerAppInfo = {
						id: 'bdock:' + curApp.id,
						left: 0,
						top:
							index == 0
								? this.DOCKER_APP_START_GAP
								: this.DOCKER_APP_START_GAP +
								  this.DOCKER_APP_SIZE * index +
								  this.DOCKER_APP_GAP * index,
						size: this.DOCKER_APP_SIZE,
						icon: curApp.icon,
						name: curApp.name,
						title: curApp.title,
						namespace: curApp.namespace!,
						owner: curApp.owner!,
						url: curApp.url!,
						is_temp: false,
						show_dot: false
					};
					this.dockerApps.push(d);
					index = index + 1;
				}
			}
		},

		async get_mobile_apps_info() {
			await this.update_my_apps_info();

			const files = this.myApps.find((app) => app.id.startsWith('files'));
			const settings = this.myApps.find((app) => app.id.startsWith('settings'));
			const profile = this.myApps.find((app) => app.id.startsWith('profile'));
			const wise = this.myApps.find((app) => app.id.startsWith('wise'));
			const vault = this.myApps.find((app) => app.id.startsWith('vault'));

			this.profile_id = profile?.id;

			const docker_list = [
				settings?.id,
				files?.id,
				'launchpad',
				wise?.id,
				vault?.id
			];

			this.dockerApps = [];
			let index = 0;
			for (let j = 0; j < docker_list.length; ++j) {
				let curApp = this.myApps.find((app) => app.id == docker_list[j]);

				if (docker_list[j] == 'launchpad') {
					curApp = {
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

				if (curApp) {
					const d: DockerAppInfo = {
						id: 'bdock:' + curApp.id,
						left: 0,
						top:
							index == 0
								? this.DOCKER_APP_START_GAP
								: this.DOCKER_APP_START_GAP +
								  this.DOCKER_APP_SIZE * index +
								  this.DOCKER_APP_GAP * index,
						size: this.DOCKER_APP_SIZE,
						icon: curApp.icon,
						name: curApp.name,
						title: curApp.title,
						namespace: curApp.namespace!,
						owner: curApp.owner!,
						url: curApp.url!,
						is_temp: false,
						show_dot: false
					};
					this.dockerApps.push(d);
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
			this.relocate_application_place(this.myApps);
		},

		async update_my_apps_info() {
			// if (!tokenStore.token) {
			// 	return;
			// }
			const data: TerminusApp[] = await axios.post(
				tokenStore.url + '/server/myApps',
				{}
			);
			this.axiosAppInfo = data;

			this.myApps = [];

			for (let i = 0; i < data.length; ++i) {
				if (data[i].state === 'uninstalling') {
					continue;
				}
				if (!data[i].entrances || data[i].entrances.length == 0) {
					this.myApps.push({
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
							const state =
								data[i].state === 'running'
									? data[i].entrances[j].state
									: data[i].state;
							this.myApps.push({
								...data[i],
								state,
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

			this.relocate_application_place(this.myApps);

			const curApp = {
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
			this.myApps.push(curApp);
		},

		relocate_application_place(relocate_apps: AppInfo[]) {
			this.launchPadApps = [];
			this.desktopApps = [];

			const t: any = {};
			for (let i = 0; i < relocate_apps.length; ++i) {
				if (relocate_apps[i].id == 'launchpad') {
					continue;
				}
				t[relocate_apps[i].id] = '1';

				if (i % (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM) == 0) {
					this.launchPadApps.push([]);
				}

				const page_num = i % (this.DESKTOP_APP_X_NUM * this.DESKTOP_APP_Y_NUM);
				const y = Math.floor(page_num / this.DESKTOP_APP_X_NUM);
				const x = page_num - y * this.DESKTOP_APP_X_NUM;

				const d: DesktopAppInfo = {
					id: 'bdesk:' + relocate_apps[i].id,
					appid: 'bdesk:' + relocate_apps[i].appid,
					index: i,
					page: this.launchPadApps.length - 1,
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

				this.launchPadApps[this.launchPadApps.length - 1].push(i);

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
			return this.dockerApps.find((app) => app.id == id);
		},

		async remove_app_on_docker(id: string) {
			const index: number = this.dockerApps.findIndex((app) => app.id == id);

			if (index >= 0) {
				this.dockerApps.splice(index, 1);
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
			const t = this.dockerApps.find((app) => app.id == rid);
			return t != undefined;
		},

		async add_app_on_docker_bottom(id: string) {
			const index = this.dockerApps.length;
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

			const a: any = this.myApps.find((app) => app.id == rid);

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
				this.dockerApps.push(d);
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
				this.dockerApps.push(d);
			}
		},

		async uninstall_application(app_name: string | null) {
			if (!app_name) {
				return;
			}

			this.myApps = this.myApps.filter((item) => item.fatherName !== app_name);
			this.relocate_application_place(this.myApps);
			const data: any = await axios.get(
				tokenStore.url + '/server/uninstall/' + app_name,
				{}
			);
		}
	}
});
