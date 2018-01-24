import { Container } from 'inversify';

import { Kudos } from '../../src/command/kudos';
import { Context } from '../../src/context';
import { TYPES } from '../../src/service';
import { SqliteKudosService } from '../../src/service/kudos';
import { SqliteUserService } from '../../src/service/user';
import { dummy, initialize } from '../testutil';

describe('kudos', () => {
    const container = new Container();
    const files = ['src/service/kudos.sqlite.sql', 'src/service/user.sqlite.sql', 'test/command/kudos.sqlite.test.sql'];
    const db = initialize(container, 'test/command/kudos.test.sqlite', ...files);
    beforeEach(db.setup);
    afterEach(db.teardown);

    let kudos: Kudos;
    beforeAll(async () => {
        container.bind(TYPES.User).to(SqliteUserService);
        container.bind(TYPES.Kudos).to(SqliteKudosService);
        container.bind(Kudos).toSelf();
    });
    beforeEach(() => {
        kudos = container.get(Kudos);
    });

    test('require args', () => {
        const context = new Context(dummy());

        kudos.initialize([]);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('updateKudos > few args', () => {
        const context = new Context(dummy());

        kudos.initialize(['++']);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('updateKudos > user not found', () => {
        const context = new Context(dummy());

        kudos.initialize(['++', 'ppp']);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('updateKudos > require join', () => {
        const user = {
            id: 'trtt',
            displayName: 'john',
            birthday: '0921',
            email: 'john@example.com',
        };
        const context = new Context(user);

        kudos.initialize(['++', 'bbb']);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('increment', async () => {
        const user = dummy();
        const context = new Context(user);

        kudos.initialize(['++', 'bbb']);

        expect(await kudos.execute(context)).toBeTruthy();
        const q = await db.get<{ quantity: number }>('select quantity from kudos where userid = ?', 'aaa');
        expect(q.quantity).toBe(1);
        const sql = 'select op from kudos_history where userid_from = ? and userid_to = ?';
        const h = await db.get<{ op: number }>(sql, user.id, 'aaa');
        expect(h.op).toBe(1);
    });

    test('increment', async () => {
        const user = {
            id: 'aaa',
            displayName: 'john',
            birthday: '0921',
            email: 'john@example.com',
        };
        const context = new Context(user);

        kudos.initialize(['++', 'ddd']);

        expect(await kudos.execute(context)).toBeTruthy();
        const q = await db.get<{ quantity: number }>('select quantity from kudos where userid = ?', 'xxx');
        expect(q.quantity).toBe(18);
        const sql = 'select op from kudos_history where userid_from = ? and userid_to = ?';
        const h = await db.get<{ op: number }>(sql, user.id, 'xxx');
        expect(h.op).toBe(1);
    });

    test('decrement > new record', async () => {
        const user = dummy();
        const context = new Context(user);

        kudos.initialize(['--', 'fff']);

        expect(await kudos.execute(context)).toBeTruthy();
        const q = await db.get<{ quantity: number }>('select quantity from kudos where userid = ?', 'eee');
        expect(q.quantity).toBe(-1);
        const sql = 'select op from kudos_history where userid_from = ? and userid_to = ?';
        const h = await db.get<{ op: number }>(sql, user.id, 'eee');
        expect(h.op).toBe(-1);
    });

    test('decrement > update record', async () => {
        const user = dummy();
        const context = new Context(user);

        kudos.initialize(['--', 'hhh']);

        expect(await kudos.execute(context)).toBeTruthy();
        const q = await db.get<{ quantity: number }>('select quantity from kudos where userid = ?', 'ggg');
        expect(q.quantity).toBe(12);
        const sql = 'select op from kudos_history where userid_from = ? and userid_to = ?';
        const h = await db.get<{ op: number }>(sql, user.id, 'ggg');
        expect(h.op).toBe(-1);
    });

    test('info > myself', async () => {
        const user = {
            id: 'iii',
            displayName: 'john',
            birthday: '0921',
            email: 'john@example.com',
        };
        const context = new Context(user);

        kudos.initialize(['show']);

        expect(await kudos.execute(context)).toBeTruthy();
    });

    test('info > user', async () => {
        const user = {
            id: 'iii',
            displayName: 'john',
            birthday: '0921',
            email: 'john@example.com',
        };
        const context = new Context(user);

        kudos.initialize(['show', 'lll']);

        expect(await kudos.execute(context)).toBeTruthy();
    });

    test('rank', async () => {
        const context = new Context(dummy());
        kudos.initialize(['rank']);

        expect(await kudos.execute(context)).toBeTruthy();
    });

    test('sender_rank', async () => {
        const context = new Context(dummy());
        kudos.initialize(['sender_rank']);

        expect(await kudos.execute(context)).toBeTruthy();
    });

    test('history', async () => {
        const context = new Context(dummy());
        kudos.initialize(['history']);

        expect(await kudos.execute(context)).toBeTruthy();
    });

    test('reaction > add > few args', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'add']);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('reaction > add', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'add', ':+1:']);

        expect(await kudos.execute(context)).toBeTruthy();
        const row = await db.get<{ op: number, icon: string }>('select op, icon from kudos_reaction where icon = ":+1:"');
        expect(row).toBeTruthy();
        expect(row.op).toBe(1);
    });

    test('reaction > add > invalid number', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'add', ':+1:', '3z']);

        expect(await kudos.execute(context)).toBeTruthy();
        const row = await db.get<{ op: number, icon: string }>('select op, icon from kudos_reaction where icon = ":+1:"');
        expect(row).toBeTruthy();
        expect(row.op).toBe(1);
    });

    test('reaction > add', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'add', ':+1:', '3']);

        expect(await kudos.execute(context)).toBeTruthy();
        const row = await db.get<{ op: number, icon: string }>('select op, icon from kudos_reaction where icon = ":+1:"');
        expect(row).toBeTruthy();
        expect(row.op).toBe(3);
    });

    test('reaction > delete > few args', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'remove']);

        return kudos.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('reaction > delete', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'rm', ':+1:']);

        expect(await kudos.execute(context)).toBeTruthy();
        const row = await db.get<{ cnt: number }>('select count(id) from kudos_reaction');
        expect(row.cnt).toBe(1);
    });

    test('reaction > list', async () => {
        const context = new Context(dummy());
        kudos.initialize(['reaction', 'list']);

        expect(await kudos.execute(context)).toBeTruthy();
    });
});
