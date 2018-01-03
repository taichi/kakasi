import { ICommand, ICommandRepository } from './commands';
import { evaluate } from './interpreter';
import { parse } from './parser';
import { make, Random } from './random';

// tslint:disable:no-any no-reserved-keywords
export class Context {

    public rand: Random;
    private slot: Map<string, any>;

    constructor(rand: Random = make()) {
        this.rand = rand;
        this.slot = new Map();
    }

    public get(key: string): any | undefined {
        return this.slot.get(key);
    }

    public set(key: string, value: any): this {
        this.slot.set(key, value);

        return this;
    }

    public has(key: string): boolean {
        return this.slot.has(key);
    }

    public delete(key: string): boolean {
        return this.slot.delete(key);
    }

    public evaluate(repos: ICommandRepository, message: string): Promise<string> {
        const nodes = parse<Promise<string>>(message.trim());

        return evaluate(repos, this, nodes)
            .then((cmd: ICommand) => cmd.execute(this));
    }
}
