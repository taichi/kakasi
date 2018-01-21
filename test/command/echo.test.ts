// tslint:disable-next-line:import-name
import { Echo } from '../../src/command/echo';
import { Context } from '../../src/context';
import { dummy } from '../testutil';

test('echo', () => {
    const cmd = ['aaa', 'bbb', 'ccc'];
    const echo = new Echo(cmd);

    return echo.execute(new Context(dummy()))
        .then((s: string) => {
            expect(s).toBe('aaa bbb ccc');
        });
});
