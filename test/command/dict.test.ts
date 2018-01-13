// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { STORAGE } from '../../src/command';
import { InMemoryDict, InMemoryDictEditor } from '../../src/command/dict';
import { Context } from '../../src/context';
import { dummy } from '../testutil';

test((t: TestContext) => {
    const context = new Context(dummy());
    const dict = new InMemoryDict([]);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('aaa', ['bbb']);

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => t.is(msg, 'bbb'));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('aaa', []);

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => t.is(msg, 'aaa'));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();

    context.set(STORAGE, map);

    const dict = new InMemoryDict(['aaa']);

    return dict.execute(context)
        .then((msg: string) => t.is(msg, 'aaa'));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const dict = new InMemoryDictEditor([]);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['help']);

    return dict.execute(context).then((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list', 'aaa']);

    return dict.execute(context)
        .then((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    const a = ['bbb', 'ccc', 'ddd', 'eee'];
    map.set('aaa', a);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['list', 'aaa']);

    return dict.execute(context)
        .then((msg: string) => t.is(msg, a.join('\n')));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    const a = ['bbb', 'ccc', 'ddd', 'eee'];
    map.set('aaa', a);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['add', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('aaa', ['bbb', 'ccc']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['remove', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => {
            t.truthy(msg);
            t.is(map.get('aaa').length, 1);
        });
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('bbb', []);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('aaa', ['bbb']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then(() => t.fail())
        .catch((msg: string) => t.truthy(msg));
});

test((t: TestContext) => {
    const context = new Context(dummy());
    const map = new Map<string, string[]>();
    map.set('aaa', []);
    map.set('bbb', ['ccc']);
    context.set(STORAGE, map);

    const dict = new InMemoryDictEditor(['alias', 'aaa', 'bbb']);

    return dict.execute(context)
        .then((msg: string) => t.truthy(msg));
});
