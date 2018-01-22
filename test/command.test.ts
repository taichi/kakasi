import { Container } from 'inversify';

import { CommandFactory, CommandRepository, core } from '../src/command';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';

import { dummy } from './testutil';

test('CommandRepository', async () => {
    const df = async (config: Config, args: string[]) => { return { execute: async () => args.join(' ') }; };
    const cr = new CommandRepository(DEFAULT, df, new Container());

    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, async (config: Config, args: string[]) => { return { execute: async () => a }; });
    }

    const aaa = await cr.find(['aaa', 'bbb', 'cccc']);
    await aaa.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('aaa'));
    const ddd = await cr.find(['zzz', 'xxxx', 'yyyy']);
    await ddd.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('zzz xxxx yyyy'));
});

test('CommandRepository', async () => {
    const container = new Container();
    const cr = core(DEFAULT, container);

    const cmd = await cr.find(['echo', 'aaa', 'bbb']);

    await cmd.execute(new Context(dummy()))
        .then((s: string) => {
            expect(s).toBe('aaa bbb');
        });
});
