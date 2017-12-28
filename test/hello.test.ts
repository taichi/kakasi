// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { hello } from '../src/hello';

test((t: TestContext) => {
    t.is(hello('john'), 'Hello john');
});
