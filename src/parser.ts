import * as nearley from 'nearley';
import * as SPEC from './grammar';
import { Node } from './node';

const GRAMMER = nearley.Grammar.fromCompiled(SPEC);

export function parse(value: string): Node[] {
    const parser = new nearley.Parser(GRAMMER);
    const results = parser.feed(value).finish();

    return results[0];
}
