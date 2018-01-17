// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { STORAGE } from '../../src/command';
import { Context } from '../../src/context';

import { dummy, makeDbRoom, SqliteContext } from '../testutil';

import { User } from '../../src/command/user.sqlite';

const DB_ROOM = makeDbRoom('test/command/user.test.sqlite');

test.before(async (t: TestContext) => {
    await DB_ROOM.setup('src/command/user.sqlite.sql', 'test/command/user.sqlite.test.sql');
});

test.beforeEach(DB_ROOM.open);

test.afterEach(DB_ROOM.close);

test.after(DB_ROOM.teardown);

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

test.serial('alias', async (t: SqliteContext) => {
    const context = new Context(dummy());
    context.set(STORAGE, t.context.db);

    const user = new User(['ln']);

    return user.execute(context)
        .then(() => t.fail())
        .catch((msg: Error) => {
            t.falsy(msg.message);
            t.truthy(msg);
        });
});

test.serial('alias', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['alias', 'xyxyx']);

    t.truthy(await user.execute(context));
    const data = await t.context.db
        .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', context.user.id, 'xyxyx');
    t.is(data.name, 'xyxyx');
});

test.serial('alias', async (t: SqliteContext) => {
    const context = new Context({
        id: 'aaa',
        displayName: 'smith0346',
        email: 'john@example.com',
    });
    context.set(STORAGE, t.context.db);

    const user = new User(['alias', 'ddd', 'zyzxxx']);

    t.truthy(await user.execute(context));
    const data = await t.context.db
        .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', 'ccc', 'zyzxxx');
    t.is(data.name, 'zyzxxx');
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
