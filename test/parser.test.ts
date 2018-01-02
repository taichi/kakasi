// tslint:disable-next-line:import-name
import test, { AssertContext, Macro, TestContext } from 'ava';

import { NODE_TYPE } from '../src/node';
import { parse } from '../src/parser';

const macro: Macro<AssertContext> = (t: AssertContext, input: string, expected: string[]) => {
    const result = parse(input);
    t.deepEqual(result, expected);
};

test(macro, 'moge', [
    { type: NODE_TYPE.TEXT, value: 'moge' }]);

test(macro, 'moge hoge', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'hoge' }]);

test(macro, 'moge\thoge', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'hoge' }]);

test(macro, 'moge \t hoge', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'hoge' }]);

test(macro, 'moge "foomoge"', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foomoge' }]);

test(macro, 'moge "foo\"\"moge"', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foo\"moge' }]);

test(macro, 'moge \'foo\nmoge\'', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foo\nmoge' }]);

test(macro, 'moge \'foomoge\'', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foomoge' }]);

test(macro, 'moge \'foo\'\'moge\'', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foo\'moge' }]);

test(macro, 'moge \'foo\nmoge\'', [
    { type: NODE_TYPE.TEXT, value: 'moge' },
    { type: NODE_TYPE.TEXT, value: 'foo\nmoge' }]);

test(macro, '$(moge)', [
    {
        type: NODE_TYPE.EXPRESSION, value: [
            { type: NODE_TYPE.TEXT, value: 'moge' }],
    }]);

test(macro, '$(moge hoge)', [
    {
        type: NODE_TYPE.EXPRESSION, value: [
            { type: NODE_TYPE.TEXT, value: 'moge' },
            { type: NODE_TYPE.TEXT, value: 'hoge' }],
    }]);

test(macro, 'hoge $(moge) goge', [
    { type: NODE_TYPE.TEXT, value: 'hoge' },
    {
        type: NODE_TYPE.EXPRESSION, value: [
            { type: NODE_TYPE.TEXT, value: 'moge' },
        ],
    },
    { type: NODE_TYPE.TEXT, value: 'goge' },
]);

test(macro, 'hoge $(moge doge) goge', [
    { type: NODE_TYPE.TEXT, value: 'hoge' },
    {
        type: NODE_TYPE.EXPRESSION, value: [
            { type: NODE_TYPE.TEXT, value: 'moge' },
            { type: NODE_TYPE.TEXT, value: 'doge' },
        ],
    },
    { type: NODE_TYPE.TEXT, value: 'goge' },
]);

test(macro, 'hoge $(moge "doge doge") goge', [
    { type: NODE_TYPE.TEXT, value: 'hoge' },
    {
        type: NODE_TYPE.EXPRESSION, value: [
            { type: NODE_TYPE.TEXT, value: 'moge' },
            { type: NODE_TYPE.TEXT, value: 'doge doge' },
        ],
    },
    { type: NODE_TYPE.TEXT, value: 'goge' },
]);
