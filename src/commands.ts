export interface ICommand {
    // tslint:disable-next-line:no-any
    execute(context: Map<string, any>): Promise<string>;
}

export type CommandFactory = (cmd: string[]) => ICommand;

export interface ICommandRepository {

    register(key: string, factory: CommandFactory): this;

    find(command: string[]): ICommand;
}

export class CommandRepository implements ICommandRepository {

    private defaultFactory: CommandFactory;
    private commands: Map<string, CommandFactory>;

    constructor(factory: CommandFactory) {
        this.defaultFactory = factory;
        this.commands = new Map<string, CommandFactory>();
    }

    public register(key: string, factory: CommandFactory): this {
        this.commands.set(`${key}`, factory);

        return this;
    }

    public find(command: string[]): ICommand {
        const [key, ...body] = command;
        const fn = this.commands.get(key);
        if (fn) {
            return fn(body);
        }

        return this.defaultFactory([key, ...body]);
    }

}
