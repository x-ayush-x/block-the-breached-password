import packageInfo from '../../package.json' with { type: 'json' };

// One source for UI and exported evidence; application and policy versions differ.
export const APP_VERSION = packageInfo.version;
