// tslint:disable-next-line:import-name
import { CommandRepository, core } from '../src/command';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';
import { dummy } from './testutil';

test('CommandRepository', async () => {
    const df = (config: Config, args: string[]) => { return { execute: () => Promise.resolve(args.join(' ')) }; };
    const cr = new CommandRepository(DEFAULT, df);

    for (const a of ['aaa', 'bbb', 'ccc']) {
        cr.register(a, (config: Config, args: string[]) => { return { execute: () => Promise.resolve(a) }; });
    }

    const aaa = await cr.find(['aaa', 'bbb', 'cccc']);
    await aaa.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('aaa'));
    const ddd = await cr.find(['zzz', 'xxxx', 'yyyy']);
    await ddd.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('zzz xxxx yyyy'));
});

test('CommandRepository', async () => {
    const cr = core(DEFAULT);

    const cmd = await cr.find(['echo', 'aaa', 'bbb']);

    await cmd.execute(new Context(dummy()))
        .then((s: string) => {
            expect(s).toBe('aaa bbb');
        });
});
