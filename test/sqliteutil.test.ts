import * as sqlite from 'sqlite';

import { doTransaction } from '../src/sqliteutil';

describe('sqliteutil', () => {
    let conn: sqlite.Database;
    beforeEach(async () => {
        conn = await sqlite.open(':memory:');
        await conn.exec('create table hoge(id integer primary key)');
    });

    test('commit', async () => {
        expect.assertions(2);
        const r = await doTransaction(conn, async () => {
            await conn.exec('insert into hoge (id) values (1)');
            return 'ok';
        });
        expect(r).toBe('ok');
        const rs = await conn.get<{ cnt: number }>('select count(id) as cnt from hoge');
        expect(rs.cnt).toBe(1);
    });

    test('rollback', async () => {
        expect.assertions(2);
        try {
            await doTransaction(conn, async () => {
                await conn.exec('insert into hoge (id) values (1)');
                return Promise.reject('tobe reject');
            });
            fail();
        } catch (err) {
            expect(err).toBe('tobe reject');
        }
        const rs = await conn.get<{ cnt: number }>('select count(id) as cnt from hoge');
        expect(rs.cnt).toBe(0);
    });

    test('throw error', async () => {
        expect.assertions(2);
        try {
            await doTransaction(conn, async () => {
                await conn.exec('insert into hoge (id) values (1)');
                throw new Error('tobe reject');
            });
            fail();
        } catch (err) {
            expect(err.message).toBe('tobe reject');
        }
        const rs = await conn.get<{ cnt: number }>('select count(id) as cnt from hoge');
        expect(rs.cnt).toBe(0);
    });
});
