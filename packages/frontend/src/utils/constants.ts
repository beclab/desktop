import { AuthorityType } from '@desktop/core/src/types';

export const authorityLevel: AuthorityType[] = [
	{
		name: 'WorldWide',
		level: 1,
		limit: 1,
		tokenAuthentication: false,
		awsDefault: false,
		intranetDefault: false
	},
	{
		name: 'Public',
		level: 2,
		limit: 1,
		tokenAuthentication: true,
		awsDefault: false,
		intranetDefault: false
	},
	{
		name: 'Protected',
		level: 3,
		limit: 1,
		tokenAuthentication: true,
		awsDefault: true,
		intranetDefault: false
	},
	{
		name: 'Private',
		level: 4,
		limit: 2,
		tokenAuthentication: true,
		awsDefault: false,
		intranetDefault: true
	}
];

export enum SecondFactorMethod {
	TOTP = 'totp',
	Webauthn = 'webauthn',
	MobilePush = 'mobilePush',
	TerminusPass = 'terminus_pass'
}

const LaunchpadName = 'Launchpad';

export const dockerAppsDefault = [
	{
		id: 'bdock:files',
		left: 0,
		top: 12,
		size: 36,
		icon: 'https://file.bttcdn.com/appstore/files/icon.png',
		name: 'files',
		title: 'Files',
		is_temp: false,
		show_dot: false,
		disabled: true
	},
	{
		id: 'bdock:launchpad',
		left: 0,
		top: 58,
		size: 36,
		icon: 'https://file.bttcdn.com/appstore/launchpad/icon.png',
		name: LaunchpadName,
		title: 'Launchpad',
		is_temp: false,
		show_dot: false,
		disabled: true
	},
	{
		id: 'bdock:market',
		left: 0,
		top: 104,
		size: 36,
		icon: 'https://file.bttcdn.com/appstore/appstore/icon.png',
		name: 'appstore-service',
		title: 'Market',
		is_temp: false,
		show_dot: false,
		disabled: true
	},
	{
		id: 'bdock:settings',
		left: 0,
		top: 150,
		size: 36,
		icon: 'https://file.bttcdn.com/appstore/settings/icon.png',
		name: 'settings',
		title: 'Settings',
		is_temp: false,
		show_dot: false,
		disabled: true
	}
];
