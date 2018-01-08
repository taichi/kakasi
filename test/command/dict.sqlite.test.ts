// tslint:disable-next-line:import-name
import test, { Context as AC, TestContext } from 'ava';
import * as fs from 'fs';
import * as sqlite from 'sqlite';
import { promisify } from 'util';

import { Buffer } from 'buffer';
import { KEY, SqliteDict, SqliteDictEditor } from '../../src/command/dict.sqlite';
import { Context } from '../../src/context';
import { dummy } from '../../src/user';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const DATABASE = 'test/kakasi.test.sqlite';

test.before(async (t: TestContext) => {
    const ddl = await readFile('src/command/dict.sqlite.sql');
    const data = await readFile('test/command/dict.sqlite.test.sql');
    const db = await sqlite.open(DATABASE);

    await db.exec(ddl.toString('utf-8'));
    await db.exec(data.toString('utf-8'));
    await db.close();
});

test.after(async (t: TestContext) => {
    await unlink(DATABASE);
});

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

type SqliteContext = TestContext & AC<{
    db: sqlite.Database,
}>;

test.beforeEach(async (t: SqliteContext) => {
    t.context.db = await sqlite.open(DATABASE);
});

test.afterEach((t: SqliteContext) => {
    return t.context.db.close();
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDict(['ppp']);

    t.is(await dict.execute(context), 'ppp');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDict(['bbb']);

    t.is(await dict.execute(context), 'www');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDict(['eee']);

    t.is(await dict.execute(context), 'www');
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

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

test((t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['help']);

    return dict.execute(context)
        .then((msg: string) => t.truthy(msg));
});

test((t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['list']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['list', 'aaa']);

    t.is(await dict.execute(context), ['xxx', 'yyy', 'zzz'].join('\n'));
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['list', 'ccc']);

    t.is(await dict.execute(context), ['xxx', 'yyy', 'zzz'].join('\n'));
});

test((t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['add', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test((t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['add', 'aaa', 'zzz']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['add', 'ggg', 'zzz']);

    t.truthy(await dict.execute(context));
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa', 'ppp']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'ccc', 'ppp']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['remove', 'aaa', 'zzz']);

    t.truthy(await dict.execute(context));
    const row = await t.context.db.get<{ cnt: number }>('select count(id) as cnt from word_list where id_keyword = 1');
    t.is(row.cnt, 2);
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'ggg']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'ggg', 'ccc']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test(async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(KEY, t.context.db);

    const dict = new SqliteDictEditor(['alias', 'ggg', 'aaa']);

    t.truthy(await dict.execute(context));
});
