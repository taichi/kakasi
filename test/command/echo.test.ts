// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { Echo } from '../../src/command/echo';
import { Context } from '../../src/context';
import { dummy } from '../testutil';

test((t: TestContext) => {
    const cmd = ['aaa', 'bbb', 'ccc'];
    const echo = new Echo(cmd);

    return echo.execute(new Context(dummy()))
        .then((s: string) => {
            t.is(s, 'aaa bbb ccc');
        });
});
