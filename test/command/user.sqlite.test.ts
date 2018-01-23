import { Container } from 'inversify';

import { User } from '../../src/command/user';
import { Context } from '../../src/context';
import { TYPES } from '../../src/service';
import { SqliteUserService } from '../../src/service/user';

import { dummy, initialize } from '../testutil';

describe('user', () => {
    const container = new Container();
    const db = initialize(container, 'test/command/user.test.sqlite', 'src/service/user.sqlite.sql', 'test/command/user.sqlite.test.sql');
    beforeEach(db.setup);
    afterEach(db.teardown);

    let user: User;
    beforeAll(async () => {
        container.bind(TYPES.User).to(SqliteUserService);
        container.bind(User).toSelf();
    });
    beforeEach(() => {
        user = container.get(User);
    });

    test('empty', () => {
        const context = new Context(dummy());

        user.initialize([]);

        return user.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('help', async () => {
        const context = new Context(dummy());

        user.initialize(['help']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('add', async () => {
        const context = new Context(dummy());

        user.initialize(['add', '0230']);

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

        user.initialize(['add', '0123']);

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

        user.initialize(['add', 'bbb']);

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

        user.initialize(['add', '0405']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await db
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

        user.initialize(['update']);

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

        user.initialize(['update', 'name']);

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

        user.initialize(['update', 'zzz']);

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

        user.initialize(['update', 'name', 'ddd']);

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

        user.initialize(['update', 'name', 'zzz']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await db
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

        user.initialize(['update', 'birthday', '0340']);

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

        user.initialize(['update', 'birthday', '0421']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await db
            .get<{ name: string, birthday: string }>('select name, birthday from user where userid = ?', context.user.id);
        expect(data.birthday).toBe('0421');
    });

    test('alias', async () => {
        const context = new Context(dummy());

        user.initialize(['ln']);

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

        user.initialize(['alias', 'xyxyx']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await db
            .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', context.user.id, 'xyxyx');
        expect(data.name).toBe('xyxyx');
    });

    test('alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['alias', 'ddd', 'zyzxxx']);

        expect(await user.execute(context)).toBeTruthy();
        const data = await db
            .get<{ name: string }>('select * from user_alias where userid = ? and name = ?', 'ccc', 'zyzxxx');
        expect(data.name).toBe('zyzxxx');
    });

    test('info', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['info']);

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

        user.initialize(['info', 'ddd']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('info', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['info']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('remove', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['rm']);

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

        user.initialize(['rm', 'aaa']);

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

        user.initialize(['rm', 'alias', 'zxc']);

        expect(await user.execute(context)).toBeTruthy();

        const ua = await db.get<{ cnt: number }>('select count(id) cnt from user_alias where name = "zxc";');
        expect(ua.cnt).toBe(0);
    });

    test('list', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['ls']);

        expect(await user.execute(context)).toBeTruthy();
    });

    test('list', async () => {
        const context = new Context({
            id: 'zzz',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['list', 'aaa']);

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

        user.initialize(['list', 'alias']);

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

        user.initialize(['ls', 'alias']);
        expect(await user.execute(context)).toBeTruthy();
    });

    test('list alias', async () => {
        const context = new Context({
            id: 'aaa',
            displayName: 'smith0346',
            email: 'john@example.com',
        });

        user.initialize(['ls', 'alias', 'pxecd']);
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

        user.initialize(['ls', 'alias', 'zxd']);
        expect(await user.execute(context)).toBeTruthy();
    });
});
