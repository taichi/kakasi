import { Buffer } from 'buffer';
import * as fs from 'fs';
import * as sqlite from 'sqlite';
import { promisify } from 'util';

import { Context } from '../src/context';

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

export type DbRoom = {
    setup(...args: string[]): Promise<void>;

    open(): Promise<sqlite.Database>;

    close(): Promise<void>;

    teardown(): Promise<void>;
};

export function makeDbRoom(database: string): DbRoom {
    let conn: sqlite.Database;
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

        open: async (): Promise<sqlite.Database> => {
            conn = await sqlite.open(database);
            return conn;
        },

        close: async (): Promise<void> => {
            return conn.close();
        },

        teardown: async () => {
            await unlink(database).catch(() => {
                // suppress error
            });
        },
    };
}
