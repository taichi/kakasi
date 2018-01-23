// tslint:disable-next-line:no-import-side-effect
import 'reflect-metadata';

import { Container, inject, injectable } from 'inversify';

import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as sqlite from 'sqlite';
import { promisify } from 'util';

import { Context } from '../src/context';
import { TYPES } from '../src/sqliteutil';
import { RuntimeUser } from '../src/user';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export function dummy(): RuntimeUser {
    return {
        id: 'xxx',
        displayName: 'John Doe',
        email: 'john@example.com',
    };
}

export const initialize = (container: Container, database: string, ...queries: string[]) => {
    let conn: sqlite.Database;
    container.bind(TYPES.DatabaseProvider)
        .toProvider<sqlite.Database>(() => async () => conn);
    return {
        setup: async () => {
            await unlink(database).catch(() => {
                // suppress error
            });
            conn = await sqlite.open(database);
            for (const p of queries) {
                const sql = await readFile(p);
                await conn.exec(sql.toString('utf-8'));
            }
        },

        // tslint:disable-next-line:no-any
        get: async <T>(sql: string, ...args: any[]): Promise<T> => {
            return conn.get<T>(sql, ...args);
        },

        teardown: async () => {
            if (conn) {
                await conn.close();
            }
            await unlink(database).catch(() => {
                // suppress error
            });
        },
    };
};
