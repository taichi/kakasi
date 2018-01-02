
export enum NODE_TYPE {
    EXPRESSION,
    TEXT,
}

export function node(t: NODE_TYPE, index: number) {
    return (d: {}[]) => {
        return { type: t, value: d[index] };
    };
}
