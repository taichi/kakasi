// tslint:disable-next-line:import-name
import test, { TestContext } from 'ava';

import { make } from '../src/random';

test((t: TestContext) => {
    const r = make();
    t.truthy(r);

    t.true(0 < r());
});
