import * as fs from 'fs';

export type Config = {
    slack: {
        access_token: string;
    };
    twitter: {
        access_token: string;
    };
    aws: {
        access_token: string;
    };
    storage: 'memory' | 'sqlite';
    sqlite?: {
        filename: string;
        verbose: boolean;
        cached: boolean;
    };
};

export const DEFAULT: Config = {
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
    sqlite: {
        filename: 'kakasi.sqlite',
        verbose: false,
        cached: false,
    },
};

export function load(location: string): Config {
    const buf = fs.readFileSync(location);
    // tslint:disable-next-line:no-unsafe-any
    const newone: Config = JSON.parse(buf.toString('utf-8'));

    return { ...DEFAULT, ...newone };
}
