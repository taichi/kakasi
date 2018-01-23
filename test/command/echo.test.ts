import { Echo } from '../../src/command/echo';
import { Context } from '../../src/context';
import { dummy } from '../testutil';

test('echo', () => {
    const echo = new Echo();
    echo.initialize(['aaa', 'bbb', 'ccc']);

    return echo.execute(new Context(dummy()))
        .then((s: string) => {
            expect(s).toBe('aaa bbb ccc');
        });
});
