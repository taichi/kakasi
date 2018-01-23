import { ICommand, ICommandRepository } from './command';
import { Context } from './context';
import { ComboNode, ExpressionNode, IVisitor, Node, TextNode } from './node';

export function evaluate(repos: ICommandRepository, context: Context, nodes: Node<Promise<string>>[]): Promise<ICommand> {
    const visitor = new Visitor(repos, context);

    const pros = nodes.map((n: Node<Promise<string>>): Promise<string> => n.accept(visitor));

    return Promise.all(pros)
        .then((texts: string[]) => repos.find(texts));
}

export class Visitor implements IVisitor<Promise<string>> {

    private repos: ICommandRepository;
    private context: Context;

    constructor(repos: ICommandRepository, context: Context) {
        this.repos = repos;
        this.context = context;
    }

    public visitText(n: TextNode<Promise<string>>): Promise<string> {
        return Promise.resolve(n.value);
    }

    public visitExpression(n: ExpressionNode<Promise<string>>): Promise<string> {
        return this.repos.find(n.value.map((v: TextNode<Promise<string>>) => v.value))
            .execute(this.context);
    }

    public visitCombo(n: ComboNode<Promise<string>>): Promise<string> {
        return Promise.all(n.value.map((v: Node<Promise<string>>) => v.accept(this)))
            .then((a: string[]) => a.join(''));
    }
}
