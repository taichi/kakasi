// tslint:disable-next-line:import-name
import test, { Context as AC, TestContext } from 'ava';
import * as fs from 'fs';
import * as sqlite from 'sqlite';
import { promisify } from 'util';

import { Buffer } from 'buffer';
import { STORAGE } from '../../src/command';
import { User } from '../../src/command/user.sqlite';
import { Context } from '../../src/context';
import { dummy } from '../../src/user';

const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const DATABASE = 'test/command/user.test.sqlite';

type SqliteContext = TestContext & AC<{
    db: sqlite.Database,
}>;

test.before(async (t: TestContext) => {
    await unlink(DATABASE).catch(() => {
        // suppress error
    });

    const ddl = await readFile('src/command/user.sqlite.sql');
    const data = await readFile('test/command/user.sqlite.test.sql');
    const db: sqlite.Database = await sqlite.open(DATABASE);

    await db.exec(ddl.toString('utf-8'));
    await db.exec(data.toString('utf-8'));
    await db.close();
});

test.beforeEach(async (t: SqliteContext) => {
    const db = await sqlite.open(DATABASE);
    db.on('trace', (sql: string) => t.log(sql));
    t.context.db = db;
});

test.afterEach(async (t: SqliteContext) => {
    await t.context.db.close();
});

test.after(async (t: TestContext) => {
    await unlink(DATABASE);
});

test((t: TestContext) => {
    const context = new Context(dummy());

    const user = new User([]);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test((t: TestContext) => {
    const context = new Context(dummy());

    const user = new User(['aaa']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test('help', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const user = new User(['help']);

    t.truthy(await user.execute(context));
});

test.serial('add', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const user = new User(['add', '0230']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('add', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['add', '0123']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('add', async (t: SqliteContext) => {
    const context = new Context({
        id: 'zzz',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['add', 'bbb']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('add', async (t: SqliteContext) => {
    const context = new Context({
        id: 'bbb',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['add', '0405']);

    t.truthy(await user.execute(context));
    const data = await t.context.db
        .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
    t.is(data.name, 'smith0346');
    t.is(data.birthday, '0405');
});

test.serial('update', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('update', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'name']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('update', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'zzz']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('update name', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'name', 'ddd']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('update name', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'name', 'zzz']);

    t.truthy(await user.execute(context));
    const data = await t.context.db
        .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
    t.is(data.name, 'zzz');
    t.is(data.birthday, '0220');
});

test.serial('update birthday', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'john doe',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'birthday', '0340']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('update birthday', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['update', 'birthday', '0421']);

    t.truthy(await user.execute(context));
    const data = await t.context.db
        .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
    t.is(data.birthday, '0421');
});

test.serial('info', async (t: SqliteContext) => {
    const context = new Context({
        id: 'zzz',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['info']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('info', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['info', 'ddd']);

    t.truthy(await user.execute(context));
});

test.serial('info', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['info']);

    t.truthy(await user.execute(context));
});
