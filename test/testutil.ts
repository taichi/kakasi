import { Context as AC, TestContext } from 'ava';

import * as fs from 'fs';
import * as sqlite from 'sqlite';
import { promisify } from 'util';

import { Buffer } from 'buffer';
import { Context } from '../src/context';

import { IUser } from '../src/user';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

export function dummy(): IUser {
    return {
        id: 'xxx',
        displayName: 'John Doe',
        email: 'john@example.com',
    };
}

export type SqliteContext = TestContext & AC<{
    db: sqlite.Database,
}>;

export type DbRoom = {
    setup(...args: string[]): Promise<void>;

    open(t: SqliteContext): Promise<void>;

    close(t: SqliteContext): Promise<void>;

    teardown(): Promise<void>;
};

export function makeDbRoom(database: string): DbRoom {
    return {
        setup: async (...args: string[]) => {
            await unlink(database).catch(() => {
                // suppress error
            });
            const db = await sqlite.open(database);
            for (const p of args) {
                const sql = await readFile(p);
                await db.exec(sql.toString('utf-8'));
            }

            await db.close();
        },

        open: async (t: SqliteContext): Promise<void> => {
            t.context.db = await sqlite.open(database);
        },

        close: async (t: SqliteContext): Promise<void> => {
            await t.context.db.close();
        },

        teardown: async () => {
            await unlink(database).catch(() => {
                // suppress error
            });
        },
    };
}
