// tslint:disable-next-line:import-name
import test, { AssertContext, Macro, TestContext } from 'ava';

import { parse } from '../src/parser';

const macro: Macro<AssertContext> = (t: AssertContext, input: string, expected: string[]) => {
    const result = parse(input);
    t.deepEqual(result, expected);
};

test(macro, 'moge hoge "foomoge"', ['moge', 'hoge', 'foomoge']);
test(macro, 'moge hoge "foom""oge"', ['moge', 'hoge', 'foom"oge']);
test(macro, 'moge hoge "foo\nmoge"', ['moge', 'hoge', 'foo\nmoge']);

test(macro, 'moge hoge \'foomoge\'', ['moge', 'hoge', 'foomoge']);
test(macro, 'moge hoge \'foo\'\'moge\'', ['moge', 'hoge', 'foo\'moge']);
test(macro, 'moge hoge \'foo\nmoge\'', ['moge', 'hoge', 'foo\nmoge']);

test(macro, 'moge hoge\t goge', ['moge', 'hoge', 'goge']);
