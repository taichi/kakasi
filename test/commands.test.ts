// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { Echo } from '../src/command/echo';
import { CommandRepository, core } from '../src/commands';
import { Config } from '../src/config';

test((t: TestContext) => {
    const df = (config: Config, args: string[]) => { return { execute: () => Promise.resolve(args.join(' ')) }; };
    // @ts-ignore
    const cr = new CommandRepository({}, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (config: Config, args: string[]) => { return { execute: () => Promise.resolve(a) }; });
    }

    const aaa = cr.find(['aaa', 'bbb', 'cccc']).execute(new Map<string, {}>())
        .then((actual: string) => t.is(actual, 'aaa'));
    const ddd = cr.find(['zzz', 'xxxx', 'yyyy']).execute(new Map<string, {}>())
        .then((actual: string) => t.is(actual, 'zzz xxxx yyyy'));

    return Promise.all([aaa, ddd]);
});

test((t: TestContext) => {
    // @ts-ignore
    const cr = core({});

    return cr.find(['echo', 'aaa', 'bbb'])
        .execute(new Map<string, {}>())
        .then((s: string) => {
            t.is(s, 'aaa bbb');
        });
});
