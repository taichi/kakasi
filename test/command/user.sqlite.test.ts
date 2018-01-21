// tslint:disable-next-line:import-name
import { STORAGE } from '../../src/command';
import { Context } from '../../src/context';

import { dummy, makeDbRoom } from '../testutil';

import { User } from '../../src/command/user.sqlite';

import * as sqlite from 'sqlite';

const DB_ROOM = makeDbRoom('test/command/user.test.sqlite');

describe('dict', () => {
    let conn: sqlite.Database;
    beforeAll(async () => {
        await DB_ROOM.setup('src/service/user.sqlite.sql', 'test/command/user.sqlite.test.sql');
    });

    beforeEach(async () => conn = await DB_ROOM.open());

    afterEach(() => DB_ROOM.close());

    afterAll(DB_ROOM.teardown);

    test('empty', () => {
        const context = new Context(dummy());

        const user = new User([]);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('NoDB', () => {
        const context = new Context(dummy());

        const user = new User(['aaa']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('help', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const user = new User(['help']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('add', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const user = new User(['add', '0230']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['add', '0123']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['add', 'bbb']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', async () => {
        const context = new Context({
            id: 'bbb',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['add', '0405']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await conn
            .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
        expect(data.name).toBe('smith0346');
        expect(data.birthday).toBe('0405');
    });

    test('update', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('update', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'name']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('update', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'zzz']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('update name', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'name', 'ddd']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('update name', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'name', 'zzz']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await conn
            .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
        expect(data.name).toBe('zzz');
        expect(data.birthday).toBe('0220');
    });

    test('update birthday', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'john doe',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'birthday', '0340']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('update birthday', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['update', 'birthday', '0421']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await conn
            .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
        expect(data.birthday).toBe('0421');
    });

    test('alias', async () => {
        const context = new Context(dummy());
        context.set(STORAGE, conn);

        const user = new User(['ln']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['alias', 'xyxyx']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await conn
            .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', context.user.id, 'xyxyx');
        expect(data.name).toBe('xyxyx');
    });

    test('alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['alias', 'ddd', 'zyzxxx']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await conn
            .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', 'ccc', 'zyzxxx');
        expect(data.name).toBe('zyzxxx');
    });

    test('info', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['info']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('info', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['info', 'ddd']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('info', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['info']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('remove', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['rm']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['rm', 'aaa']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['rm', 'alias', 'zxc']);

        expect(await user.execute(context)).toBeTruthy();

        const ua = await conn.get('select count(id) cnt from user_alias where name = "zxc";');
        expect(ua.cnt).toBe(0);
    });

    test('list', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['ls']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('list', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['list', 'aaa']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('list alias', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['list', 'alias']);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('list alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['ls', 'alias']);
        expect(await user.execute(context)).toBeTruthy();
    });

    test('list alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['ls', 'alias', 'pxecd']);
        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('list alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });
        context.set(STORAGE, conn);

        const user = new User(['ls', 'alias', 'zxd']);
        expect(await user.execute(context)).toBeTruthy();
    });
});
