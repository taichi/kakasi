// tslint:disable-next-line:import-name
import test, { Macro, TestContext } from 'ava';

import { ExpressionNode, TextNode } from '../src/node';
import { parse } from '../src/parser';

const macro: Macro<TestContext> = (t: TestContext, input: string, expected: string[]) => {
    const result = parse(input);
    t.log(JSON.stringify(result));
    t.deepEqual(result, expected);
};

test(macro, 'moge', [
    new TextNode('moge')]);

test(macro, 'moge hoge', [
    new TextNode('moge'),
    new TextNode('hoge')]);

test(macro, 'moge\thoge', [
    new TextNode('moge'),
    new TextNode('hoge')]);

test(macro, 'moge \t hoge', [
    new TextNode('moge'),
    new TextNode('hoge')]);

test(macro, 'moge "foomoge"', [
    new TextNode('moge'),
    new TextNode('foomoge')]);

test(macro, 'moge "foo\"\"moge"', [
    new TextNode('moge'),
    new TextNode('foo\"moge')]);

test(macro, 'moge \'foo\nmoge\'', [
    new TextNode('moge'),
    new TextNode('foo\nmoge')]);

test(macro, 'moge \'foomoge\'', [
    new TextNode('moge'),
    new TextNode('foomoge')]);

test(macro, 'moge \'foo\'\'moge\'', [
    new TextNode('moge'),
    new TextNode('foo\'moge')]);

test(macro, 'moge \'foo\nmoge\'', [
    new TextNode('moge'),
    new TextNode('foo\nmoge')]);

test(macro, '$(moge)', [
    new ExpressionNode(
        [new TextNode('moge')],
    )]);

test(macro, '$(moge hoge)', [
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('hoge'),
        ],
    )]);

test(macro, 'hoge $(moge) doge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
        ],
    ),
    new TextNode('doge'),
]);

test(macro, 'hoge $(moge doge) goge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('doge'),
        ],
    ),
    new TextNode('goge'),
]);

test(macro, 'hoge $(moge "doge doge") goge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('doge doge'),
        ],
    ),
    new TextNode('goge'),
]);
