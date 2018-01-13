// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { CommandFactory, CommandRepository, ICommand } from '../src/command';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';
import { dummy } from './testutil';

test((t: TestContext) => {
    const df: CommandFactory = (config: Config, args: string[]): Promise<ICommand> => {
        return Promise.resolve({
            execute: (): Promise<string> => {
                t.fail();

                return Promise.resolve('fail');
            },
        });
    };
    const cr = new CommandRepository(DEFAULT, df);

    for (const a of ['aaa', 'bbb', 'ccc']) {
        const fn: CommandFactory = (config: Config, args: string[]): Promise<ICommand> => {
            return Promise.resolve({ execute: () => Promise.resolve(`${a} ${args.join('_')}`) });
        };
        cr.register(a, fn);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd) eee');

    return cmd.then((str: string) => {
        t.is(str, 'aaa bbb ccc_ddd_eee');
    });
});

test((t: TestContext) => {
    const df: CommandFactory = (config: Config, args: string[]): Promise<ICommand> => {
        return Promise.resolve({
            execute: (): Promise<string> => {
                t.fail();

                return Promise.resolve('fail');
            },
        });
    };
    const cr = new CommandRepository(DEFAULT, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        const fn: CommandFactory = (config: Config, args: string[]): Promise<ICommand> => {
            return Promise.resolve({ execute: () => Promise.resolve(`${a} ${args.join('_')}`) });
        };
        cr.register(a, fn);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd)eee');

    return cmd.then((str: string) => {
        t.is(str, 'aaa bbb ccc_dddeee');
    });
});
