import * as fs from 'fs';

export type Config = {
    slack: {
        access_token: string,
    },
    twitter: {
        access_token: string,
    },
    aws: {
        access_token: string,
    },
    dict: string,
};

const DEFAULT: Config = {
    slack: {
        access_token: '',
    },
    twitter: {
        access_token: '',
    },
    aws: {
        access_token: '',
    },
    dict: 'memory',
};

export function load(location: string): Config {
    const buf = fs.readFileSync(location);
    const newone = JSON.parse(buf.toString('utf-8'));

    return Object.assign(DEFAULT, newone);
}
