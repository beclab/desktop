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
