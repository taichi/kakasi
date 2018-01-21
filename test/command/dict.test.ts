// tslint:disable-next-line:import-name
import { STORAGE } from '../../src/command';
import { InMemoryDict, InMemoryDictEditor } from '../../src/command/dict';
import { Context } from '../../src/context';
import { dummy } from '../testutil';

test('', () => {
    const context = new Context(dummy());
    const dict = new InMemoryDict([]);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    // tslint:disable-next-line:no-any
    const map = new Map();
    map.set('aaa', ['bbb']);

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBe('bbb'));
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    map.set('aaa', []);

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBe('aaa'));
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBe('aaa'));
});

test('', () => {
    const context = new Context(dummy());
    const dict = new InMemoryDictEditor([]);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['help']);

    return dict.execute(context).then((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list', 'aaa']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    const a = ['bbb', 'ccc', 'ddd', 'eee'];
    map.set('aaa', a);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list', 'aaa']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBe(a.join('\n')));
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    const a = ['bbb', 'ccc', 'ddd', 'eee'];
    map.set('aaa', a);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    map.set('aaa', ['bbb', 'ccc']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => {
            expect(msg).toBeTruthy();
            expect(map.get('aaa').length).toBe(1);
        });
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    map.set('bbb', []);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    map.set('aaa', ['bbb']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(fail)
        .catch((msg: string) => expect(msg).toBeTruthy());
});

test('', () => {
    const context = new Context(dummy());
    const map = new Map();
    map.set('aaa', []);
    map.set('bbb', ['ccc']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => expect(msg).toBeTruthy());
});
