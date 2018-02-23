import { Container } from 'inversify';

import { Command, ContainerCommandRepository, TYPES } from '../src/command';
import { Config, DEFAULT } from '../src/config';
import { Context } from '../src/context';
import { dummy } from './testutil';

test('evaluate', () => {
    const defval = {
        initialize: () => defval,
        execute: async () => {
            fail();

            return Promise.reject('fail');
        },
    };
    const container = new Container();
    container.bind(TYPES.DEFAULT_COMMAND).toConstantValue(defval);

    const cr = new ContainerCommandRepository(container);

    for (const a of ['aaa', 'bbb', 'ccc']) {
        let args = [];
        const val = {
            initialize: (ary: string[]) => {
                args = ary;
                return val;
            },
            execute: async () => `${a} ${args.join('_')}`,
        };
        container.bind(a).toConstantValue(val);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd) eee');

    return cmd.then((str: string) => {
        expect(str).toBe('aaa bbb ccc_ddd_eee');
    });
});

test('evaluate', () => {
    const defval = {
        initialize: () => defval,
        execute: async () => {
            fail();

            return Promise.reject('fail');
        },
    };
    const container = new Container();
    container.bind(TYPES.DEFAULT_COMMAND).toConstantValue(defval);

    const cr = new ContainerCommandRepository(container);
    for (const a of ['aaa', 'bbb', 'ccc']) {
        let args: string[];
        const val = {
            initialize: (ary: string[]) => {
                args = ary;
                return val;
            },
            execute: () => Promise.resolve(`${a} ${args.join('_')}`),
        };
        container.bind(a).toConstantValue(val);
    }

    const ctx = new Context(dummy());
    const cmd = ctx.evaluate(cr, 'aaa $(bbb ccc ddd)eee');

    return cmd.then((str: string) => {
        expect(str).toBe('aaa bbb ccc_dddeee');
    });
});
