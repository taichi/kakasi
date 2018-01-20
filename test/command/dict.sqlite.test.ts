// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { STORAGE } from '../../src/command';
import { Context } from '../../src/context';

import { dummy, makeDbRoom, SqliteContext } from '../testutil';

import { SqliteDict, SqliteDictEditor } from '../../src/command/dict.sqlite';

const DB_ROOM = makeDbRoom('test/command/dict.test.sqlite');

test.before(async (t: TestContext) => {
    await DB_ROOM.setup('src/service/dict.sqlite.sql', 'test/command/dict.sqlite.test.sql');
});

test.beforeEach(DB_ROOM.open);

test.afterEach(DB_ROOM.close);

test.after(DB_ROOM.teardown);

test((t: TestContext) => {
    const context = new Context(dummy());

    const dict = new SqliteDict([]);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test((t: TestContext) => {
    const context = new Context(dummy());

    const dict = new SqliteDict(['aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDict(['ppp']);

    t.is(await dict.execute(context), 'ppp');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDict(['bbb']);

    t.is(await dict.execute(context), 'www');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDict(['eee']);

    t.is(await dict.execute(context), 'www');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDict(['aaa']);
    const value = await dict.execute(context);

    t.true(-1 < ['zzz', 'yyy', 'xxx'].findIndex((v: string) => v === value));
});

test((t: TestContext) => {
    const context = new Context(dummy());

    const dict = new SqliteDictEditor([]);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test((t: TestContext) => {
    const context = new Context(dummy());

    const dict = new SqliteDictEditor(['aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('help', (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['help']);

    return dict.execute(context)
        .then((msg: string) => t.truthy(msg));
});

test.serial('list', (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['list']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('list', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['list', 'aaa']);

    t.is(await dict.execute(context), ['xxx', 'yyy', 'zzz'].join('\n'));
});

test.serial('list', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['list', 'ccc']);

    t.is(await dict.execute(context), ['xxx', 'yyy', 'zzz'].join('\n'));
});

test('add', (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['add', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('add', (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['add', 'aaa', 'zzz']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('add', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['add', 'ggg', 'zzz']);

    t.truthy(await dict.execute(context));
});

test('remove', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('remove', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa', 'ppp']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('remove', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'ccc', 'ppp']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('remove', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa', 'zzz']);

    t.truthy(await dict.execute(context));
    const row = await t.context.db.get<{ cnt: number }>('select count(id) as cnt from word_list where id_keyword = 1');
    t.is(row.cnt, 2);
});

test('alias', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'ggg']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('alias', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('alias', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'ggg', 'ccc']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('alias', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'hhh', 'aaa']);

    t.truthy(await dict.execute(context));
});
