// tslint:disable-next-line:import-name
import { STORAGE } from '../../src/command';
import { Context } from '../../src/context';

import { dummy, makeDbRoom } from '../testutil';

import { SqliteDict, SqliteDictEditor } from '../../src/command/dict.sqlite';

const DB_ROOM = makeDbRoom('test/command/dict.test.sqlite');

describe('dict', () => {
    let conn;
    beforeAll(async () => {
        await DB_ROOM.setup('src/service/dict.sqlite.sql', 'test/command/dict.sqlite.test.sql');
    });

    beforeEach(async () => conn = await DB_ROOM.open());

    afterEach(() => DB_ROOM.close());

    afterAll(DB_ROOM.teardown);

    test('empty', () => {
        const context = new Context(dummy());

        const dict = new SqliteDict([]);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('NoDB', () => {
        const context = new Context(dummy());

        const dict = new SqliteDict(['aaa']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('HELP', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDict(['ppp']);

        expect(await dict.execute(context)).toBe('ppp');
    });

    test('One Word', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDict(['bbb']);

        expect(await dict.execute(context)).toBe('www');
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDict(['eee']);

        expect(await dict.execute(context)).toBe('www');
    });

    test('one random', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDict(['aaa']);
        const value = await dict.execute(context);

        expect(-1 < ['zzz', 'yyy', 'xxx'].findIndex((v: string) => v === value)).toBe(true);
    });

    test('empty', () => {
        const context = new Context(dummy());

        const dict = new SqliteDictEditor([]);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('NoDB', () => {
        const context = new Context(dummy());

        const dict = new SqliteDictEditor(['aaa']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('help', () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['help']);

        return dict.execute(context)
            .then((msg: string) => expect(msg).toBeTruthy());
    });

    test('list', () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['list']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('list', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['list', 'aaa']);

        expect(await dict.execute(context)).toBe(['xxx', 'yyy', 'zzz'].join('\n'));
    });

    test('list', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['list', 'ccc']);

        expect(await dict.execute(context)).toBe(['xxx', 'yyy', 'zzz'].join('\n'));
    });

    test('add', () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['add', 'aaa']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['add', 'aaa', 'zzz']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['add', 'ggg', 'zzz']);

        expect(await dict.execute(context)).toBeTruthy();
    });

    test('remove', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['remove', 'aaa']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['remove', 'aaa', 'ppp']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['remove', 'ccc', 'ppp']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['remove', 'aaa', 'zzz']);

        expect(await dict.execute(context)).toBeTruthy();
        const row = await conn.get('select count(id) as cnt from word_list where id_keyword = 1');
        expect(row.cnt).toBe(2);
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['alias', 'ggg']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['alias', 'aaa', 'bbb']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['alias', 'ggg', 'ccc']);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const dict = new SqliteDictEditor(['alias', 'hhh', 'aaa']);

        expect(await dict.execute(context)).toBeTruthy();
    });
});
