
export type Node<R> = TextNode<R> | ExpressionNode<R> | ComboNode<R>;

export interface IAcceptable<R> {
    accept(visitor: IVisitor<R>): R;
}

export interface IVisitor<R> {
    visitText(n: TextNode<R>): R;
    visitExpression(n: ExpressionNode<R>): R;
    visitCombo(n: ComboNode<R>): R;
}

export class TextNode<R> implements IAcceptable<R> {
    public readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of(index: number) {
        return (d: string[]) => {
            return new TextNode(d[index]);
        };
    }

    public accept(visitor: IVisitor<R>): R {
        return visitor.visitText(this);
    }
}

export class ExpressionNode<R> implements IAcceptable<R> {
    public readonly value: TextNode<R>[];

    constructor(value: TextNode<R>[]) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of<R>(index: number) {
        return (d: TextNode<R>[][]) => {
            return new ExpressionNode(d[index]);
        };
    }

    public accept(visitor: IVisitor<R>): R {
        return visitor.visitExpression(this);
    }
}

export class ComboNode<R> implements IAcceptable<R> {
    public readonly value: (TextNode<R> | ExpressionNode<R>)[];

    constructor(value: (TextNode<R> | ExpressionNode<R>)[]) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of<R>(n: number) {
        return (d: (TextNode<R> | ExpressionNode<R>)[]) => {
            return new ComboNode(d.slice(0, n));
        };
    }

    public accept(visitor: IVisitor<R>): R {
        return visitor.visitCombo(this);
    }
}
