import * as nearley from 'nearley';

import * as SPEC from './grammar';

const GRAMMER = nearley.Grammar.fromCompiled(SPEC);

export function parse(value: string): string[] {
    const parser = new nearley.Parser(GRAMMER);
    const results = parser.feed(value).finish();

    return results[0];
}
