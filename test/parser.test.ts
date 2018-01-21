// tslint:disable-next-line:import-name
import { ComboNode, ExpressionNode, Node, TextNode } from '../src/node';
import { parse } from '../src/parser';

const assertNode = (input: string, expected: Node<{}>[]) => {
    const result = parse(input);
    expect(result).toEqual(expected);
};

test('TextNode', () => assertNode('moge', [
    new TextNode('moge')]));

test('TextNode', () => assertNode('moge hoge', [
    new TextNode('moge'),
    new TextNode('hoge')]));

test('TextNode', () => assertNode('moge\thoge', [
    new TextNode('moge'),
    new TextNode('hoge')]));

test('TextNode', () => assertNode('moge \t hoge', [
    new TextNode('moge'),
    new TextNode('hoge')]));

test('TextNode', () => assertNode('moge "foomoge"', [
    new TextNode('moge'),
    new TextNode('foomoge')]));

test('TextNode', () => assertNode('moge "foo\"\"moge"', [
    new TextNode('moge'),
    new TextNode('foo\"moge')]));

test('TextNode', () => assertNode('moge \'foo\nmoge\'', [
    new TextNode('moge'),
    new TextNode('foo\nmoge')]));

test('TextNode', () => assertNode('moge \'foomoge\'', [
    new TextNode('moge'),
    new TextNode('foomoge')]));

test('TextNode', () => assertNode('moge \'foo\'\'moge\'', [
    new TextNode('moge'),
    new TextNode('foo\'moge')]));

test('TextNode', () => assertNode('moge \'foo\nmoge\'', [
    new TextNode('moge'),
    new TextNode('foo\nmoge')]));

test('ExpressionNode', () => assertNode('$(moge)', [
    new ExpressionNode(
        [new TextNode('moge')],
    )]));

test('ExpressionNode', () => assertNode('$(moge hoge)', [
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('hoge'),
        ],
    )]));

test('ExpressionNode', () => assertNode('hoge $(moge) doge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
        ],
    ),
    new TextNode('doge'),
]));

test('ExpressionNode', () => assertNode('hoge $(moge doge) goge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('doge'),
        ],
    ),
    new TextNode('goge'),
]));

test('ExpressionNode', () => assertNode('hoge $(moge "doge doge") goge', [
    new TextNode('hoge'),
    new ExpressionNode(
        [
            new TextNode('moge'),
            new TextNode('doge doge'),
        ],
    ),
    new TextNode('goge'),
]));

test('ComboNode', () => assertNode('hoge$(moge)', [
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
    ]),
]));

test('ComboNode', () => assertNode('$(moge)goge', [
    new ComboNode([
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
]));

test('ComboNode', () => assertNode('hoge$(moge)goge', [
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
]));

test('ComboNode', () => assertNode('aaa hoge$(moge)goge', [
    new TextNode('aaa'),
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
]));

test('ComboNode', () => assertNode('hoge$(moge)goge aaa', [
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
    new TextNode('aaa'),
]));

test('ComboNode', () => assertNode('$(aaa) hoge$(moge)goge', [
    new ExpressionNode(
        [
            new TextNode('aaa'),
        ],
    ),
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
]));

test('ComboNode', () => assertNode('hoge$(moge)goge $(aaa)', [
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
    new ExpressionNode(
        [
            new TextNode('aaa'),
        ],
    ),
]));

test('ComboNode', () => assertNode('aaa hoge$(moge)goge $(bbb)', [
    new TextNode('aaa'),
    new ComboNode([
        new TextNode('hoge'),
        new ExpressionNode(
            [
                new TextNode('moge'),
            ],
        ),
        new TextNode('goge'),
    ]),
    new ExpressionNode(
        [
            new TextNode('bbb'),
        ],
    ),
]));

test('TextNode', () => assertNode('"hoge$(moge)goge"', [
    new TextNode('hoge$(moge)goge'),
]));

test('TextNode', () => assertNode('\'hoge$(moge)goge\'', [
    new TextNode('hoge$(moge)goge'),
]));
