import { ICommand, ICommandRepository } from './commands';
import { ExpressionNode, Node, TextNode } from './node';

// tslint:disable-next-line:no-any
export function evaluate(repos: ICommandRepository, context: Map<string, any>, nodes: Node[]): Promise<ICommand> {
    const pros = nodes.map(matches(repos, context));

    return Promise.all(pros)
        .then((texts: string[]) => repos.find(texts));
}

// tslint:disable-next-line:no-any
function matches(repos: ICommandRepository, context: Map<string, any>) {
    return (n: Node): Promise<string> => {
        if (n instanceof TextNode) {
            return Promise.resolve(n.value);
        }

        if (n instanceof ExpressionNode) {
            return repos
                .find(n.value.map((v: TextNode) => v.value))
                .execute(context);
        }

        return Promise.reject(`Unsupported Node type ${typeof n}`);
    };
}
