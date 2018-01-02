// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { CommandRepository, ICommand, ICommandRepository } from '../src/commands';
import { Config } from '../src/config';
import { evaluate } from '../src/interpreter';
import { parse } from '../src/parser';

test((t: TestContext) => {
    const df = (config: Config, args: string[]) => { return { execute: () => Promise.resolve(args.join(' ')) }; };
    //@ts-ignore
    const cr = new CommandRepository({}, df);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (config: Config, args: string[]) => { return { execute: () => Promise.resolve(`${a} ${args.join('_')}`) }; });
    }

    const nodes = parse('aaa $(bbb ccc ddd) eee');
    const ctx = new Map<string, {}>();
    const cmd = evaluate(cr, ctx, nodes);

    return cmd
        .then((c: ICommand) => c.execute(ctx))
        .then((str: string) => {
            t.is(str, 'aaa bbb ccc_ddd_eee');
        });
});
