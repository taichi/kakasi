import * as fs from 'fs';

export type Config = typeof DEFAULT;

export const DEFAULT = {
    slack: {
        access_token: '',
    },
    twitter: {
        access_token: '',
    },
    aws: {
        access_token: '',
    },
    storage: 'memory',
};

export function load(location: string): Config {
    const buf = fs.readFileSync(location);
    const newone = JSON.parse(buf.toString('utf-8'));

    return Object.assign(DEFAULT, newone);
}
