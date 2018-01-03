
export type Node = TextNode | ExpressionNode | ComboNode;

export class TextNode {
    public readonly value: string;

    constructor(value: string) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of(index: number) {
        return (d: {}[]) => {
            // @ts-ignore
            return new TextNode(d[index]);
        };
    }
}

export class ExpressionNode {
    public readonly value: TextNode[];

    constructor(value: TextNode[]) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of(index: number) {
        return (d: {}[]) => {
            // @ts-ignore
            return new ExpressionNode(d[index]);
        };
    }
}

export class ComboNode {
    public readonly value: (TextNode | ExpressionNode)[];

    constructor(value: (TextNode | ExpressionNode)[]) {
        this.value = value;
    }

    // tslint:disable-next-line:no-reserved-keywords function-name
    public static of(n: number) {
        return (d: {}[]) => {
            // @ts-ignore
            return new ComboNode(d.slice(0, n));
        };
    }
}
