// tslint:disable-next-line:import-name
import { CommandFactory, CommandRepository, ICommand } from '../src/command';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';
import { dummy } from './testutil';

test('evaluate', () => {
    const df = (config: Config, args: string[]) => {
        return Promise.resolve({
            execute: (): Promise<string> => {
                fail();

                return Promise.reject('fail');
            },
        });
    };
    const cr = new CommandRepository(DEFAULT, df);

    for (const a of ['aaa', 'bbb', 'ccc']) {
        const fn = (config: Config, args: string[]) => {
            return Promise.resolve({ execute: () => Promise.resolve(`${a} ${args.join('_')}`) });
        };
        cr.register(a, fn);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd) eee');

    return cmd.then((str: string) => {
        expect(str).toBe('aaa bbb ccc_ddd_eee');
    });
});

test('evaluate', () => {
    const df = (config: Config, args: string[]) => {
        return Promise.resolve({
            execute: (): Promise<string> => {
                fail();

                return Promise.reject('fail');
            },
        });
    };
    const cr = new CommandRepository(DEFAULT, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        const fn = (config: Config, args: string[]) => {
            return Promise.resolve({ execute: () => Promise.resolve(`${a} ${args.join('_')}`) });
        };
        cr.register(a, fn);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd)eee');

    return cmd.then((str: string) => {
        expect(str).toBe('aaa bbb ccc_dddeee');
    });
});
