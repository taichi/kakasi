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
};

export function load(location: string): Config {
    const buf = fs.readFileSync(location);

    return JSON.parse(buf.toString('utf-8'));
}
