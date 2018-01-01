import { parse } from './parser';

export interface ICommand {
    execute(): Promise<string>;
}

export type CommandFactory = (cmd: string[]) => ICommand;

export interface ICommandRepository {

    register(key: string, factory: CommandFactory): this;

    find(command: string): ICommand;
}

export class CommandRepository implements ICommandRepository {

    private readonly prefix: string;

    private defaultFactory: CommandFactory;
    private commands: Map<string, CommandFactory>;

    constructor(prefix: string, factory: CommandFactory) {
        this.prefix = prefix;
        this.defaultFactory = factory;
        this.commands = new Map<string, CommandFactory>();
    }

    public register(key: string, factory: CommandFactory): this {
        this.commands.set(`${this.prefix}${key}`, factory);

        return this;
    }

    public find(command: string): ICommand {
        const [key, ...body] = parse(command);
        const fn = this.commands.get(key);
        if (fn) {
            return fn(body);
        }

        return this.defaultFactory([key, ...body]);
    }

}
