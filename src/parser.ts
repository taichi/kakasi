import * as nearley from 'nearley';

// tslint:disable-next-line:no-require-imports no-var-requires
const GRAMMER = nearley.Grammar.fromCompiled(require('./grammar.js'));

export function parse(value: string): string[] {
    const parser = new nearley.Parser(GRAMMER);
    const results = parser.feed(value).finish();

    return results[0];
}
