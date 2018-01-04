// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { CommandRepository } from '../src/command';
import { Config } from '../src/config';
import { Context } from '../src/context';
import { dummy } from '../src/user';

test((t: TestContext) => {
    const df = (config: Config, args: string[]) => { return { execute: () => t.fail() }; };
    //@ts-ignore
    const cr = new CommandRepository({}, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (config: Config, args: string[]) => { return { execute: () => Promise.resolve(`${a} ${args.join('_')}`) }; });
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd) eee');

    return cmd.then((str: string) => {
        t.is(str, 'aaa bbb ccc_ddd_eee');
    });
});

test((t: TestContext) => {
    const df = (config: Config, args: string[]) => { return { execute: () => t.fail() }; };
    //@ts-ignore
    const cr = new CommandRepository({}, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (config: Config, args: string[]) => { return { execute: () => Promise.resolve(`${a} ${args.join('_')}`) }; });
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd)eee');

    return cmd.then((str: string) => {
        t.is(str, 'aaa bbb ccc_dddeee');
    });
});
