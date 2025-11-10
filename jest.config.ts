import type { Config } from 'jest';

const config: Config = {
	testEnvironment: 'node',
	testMatch: ['**/?(*.)+(e2e|test).[tj]s?(x)'],
	transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
	testTimeout: 20000,
	verbose: true,
};
export default config;
