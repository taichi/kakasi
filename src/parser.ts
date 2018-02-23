import * as nearley from 'nearley';
import * as SPEC from './grammar';
import { Node } from './node';

const GRAMMER = nearley.Grammar.fromCompiled(SPEC);

export function parse<R>(value: string): Node<R>[] {
    const parser = new nearley.Parser(GRAMMER);
    const results = parser.feed(value).finish();

    // tslint:disable-next-line:no-unsafe-any
    return results[0];
}
