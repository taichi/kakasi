import { Container } from 'inversify';

import { Dict, DictEditor } from '../../src/command/dict';
import { Context } from '../../src/context';

import { TYPES } from '../../src/service';
import { SqliteDictService } from '../../src/service/dict';

import { dummy, initialize } from '../testutil';

describe('dict', () => {
    const container = new Container();
    const db = initialize(container, 'test/command/dict.test.sqlite', 'src/service/dict.sqlite.sql', 'test/command/dict.sqlite.test.sql');
    beforeEach(db.setup);
    afterEach(db.teardown);

    let dict: Dict;
    let dictEd: DictEditor;
    beforeAll(async () => {
        container.bind(TYPES.Dict).to(SqliteDictService);
        container.bind(Dict).toSelf();
        container.bind(DictEditor).toSelf();
    });
    beforeEach(() => {
        dict = container.get(Dict);
        dictEd = container.get(DictEditor);
    });

    test('empty', () => {
        const context = new Context(dummy());

        dict.initialize([]);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('help', async () => {
        const context = new Context(dummy());

        dict.initialize(['ppp']);

        expect(await dict.execute(context)).toBe('ppp');
    });

    test('One Word', async () => {
        const context = new Context(dummy());

        dict.initialize(['bbb']);

        expect(await dict.execute(context)).toBe('www');
    });

    test('alias', async () => {
        const context = new Context(dummy());

        dict.initialize(['eee']);

        expect(await dict.execute(context)).toBe('www');
    });

    test('one random', async () => {
        const context = new Context(dummy());

        dict.initialize(['aaa']);
        const value = await dict.execute(context);

        expect(-1 < ['zzz', 'yyy', 'xxx'].findIndex((v: string) => v === value)).toBe(true);
    });

    test('empty', () => {
        const context = new Context(dummy());

        dictEd.initialize([]);

        return dict.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('help', () => {
        const context = new Context(dummy());

        dictEd.initialize(['help']);

        return dictEd.execute(context)
            .then((msg: string) => expect(msg).toBeTruthy());
    });

    test('list', () => {
        const context = new Context(dummy());

        dictEd.initialize(['list']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('list', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['list', 'aaa']);

        expect(await dictEd.execute(context)).toBe(['xxx', 'yyy', 'zzz'].join('\n'));
    });

    test('list', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['list', 'ccc']);

        expect(await dictEd.execute(context)).toBe(['xxx', 'yyy', 'zzz'].join('\n'));
    });

    test('add', () => {
        const context = new Context(dummy());

        dictEd.initialize(['add', 'aaa']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', () => {
        const context = new Context(dummy());

        dictEd.initialize(['add', 'aaa', 'zzz']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('add', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['add', 'ggg', 'zzz']);

        expect(await dictEd.execute(context)).toBeTruthy();
    });

    test('remove', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['remove', 'aaa']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['remove', 'aaa', 'ppp']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['remove', 'ccc', 'ppp']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('remove', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['remove', 'aaa', 'zzz']);

        expect(await dictEd.execute(context)).toBeTruthy();
        const row = await db.get<{ cnt: number }>('select count(id) as cnt from word_list where id_keyword = 1');
        expect(row.cnt).toBe(2);
    });

    test('alias', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['alias', 'ggg']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['alias', 'aaa', 'bbb']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['alias', 'ggg', 'ccc']);

        return dictEd.execute(context)
            .then(fail)
            .catch((msg: Error) => {
                expect(msg.message).toBeFalsy();
                expect(msg).toBeTruthy();
            });
    });

    test('alias', async () => {
        const context = new Context(dummy());

        dictEd.initialize(['alias', 'hhh', 'aaa']);

        expect(await dictEd.execute(context)).toBeTruthy();
    });
});
