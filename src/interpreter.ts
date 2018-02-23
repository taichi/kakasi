import { Command, CommandRepository } from './command';
import { Context } from './context';
import { ComboNode, ExpressionNode, Node, TextNode, Visitor } from './node';

export class DefaultVisitor implements Visitor<Promise<string>> {

    private repos: CommandRepository;
    private context: Context;

    constructor(repos: CommandRepository, context: Context) {
        this.repos = repos;
        this.context = context;
    }

    public visitText(n: TextNode<Promise<string>>): Promise<string> {
        return Promise.resolve(n.value);
    }

    public visitExpression(n: ExpressionNode<Promise<string>>): Promise<string> {
        const cmd = this.repos.find(n.value.map((v: TextNode<Promise<string>>) => v.value));
        return cmd.execute(this.context);
    }

    public visitCombo(n: ComboNode<Promise<string>>): Promise<string> {
        return Promise.all(n.value.map((v: Node<Promise<string>>) => v.accept(this)))
            .then((a: string[]) => a.join(''));
    }
}

export function evaluate(repos: CommandRepository, context: Context, nodes: Node<Promise<string>>[]): Promise<Command> {
    const visitor = new DefaultVisitor(repos, context);

    const pros = nodes.map((n: Node<Promise<string>>): Promise<string> => n.accept(visitor));

    return Promise.all(pros)
        .then((texts: string[]) => repos.find(texts));
}
