import { Container } from 'inversify';

import { ContainerCommandRepository, TYPES } from '../src/command';
import { Echo } from '../src/command/echo';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';

import { dummy } from './testutil';

test('CommandRepository', async () => {
    const container = new Container();
    container.bind(TYPES.DEFAULT_COMMAND).to(Echo);
    const cr = new ContainerCommandRepository(container);

    for (const a of ['aaa', 'bbb', 'ccc']) {
        const val = {
            initialize: () => val,
            execute: async () => a,
        };
        container.bind(a).toConstantValue(val);
    }

    const aaa = cr.find(['aaa', 'bbb', 'cccc']);
    await aaa.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('aaa'));
    const ddd = cr.find(['zzz', 'xxxx', 'yyyy']);
    await ddd.execute(new Context(dummy()))
        .then((actual: string) => expect(actual).toBe('zzz xxxx yyyy'));
});
