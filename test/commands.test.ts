// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { CommandRepository } from '../src/commands';

test((t: TestContext) => {
    const df = (args: string[]) => { return { execute: () => Promise.resolve(args.join(' ')) }; };
    const cr = new CommandRepository(df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (args: string[]) => { return { execute: () => Promise.resolve(a) }; });
    }

    const aaa = cr.find(['aaa', 'bbb', 'cccc']).execute(new Map<string, {}>())
        .then((actual: string) => t.is(actual, 'aaa'));
    const ddd = cr.find(['zzz', 'xxxx', 'yyyy']).execute(new Map<string, {}>())
        .then((actual: string) => t.is(actual, 'zzz xxxx yyyy'));

    return Promise.all([aaa, ddd]);
});
