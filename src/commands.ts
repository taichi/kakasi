import { Config } from './config';

export interface ICommand {
    // tslint:disable-next-line:no-any
    execute(context: Map<string, any>): Promise<string>;
}

export type CommandFactory = (config: Config, cmd: string[]) => ICommand;

export interface ICommandRepository {

    register(key: string, factory: CommandFactory): this;

    find(command: string[]): ICommand;
}

export class CommandRepository implements ICommandRepository {

    private config: Config;
    private defaultFactory: CommandFactory;
    private commands: Map<string, CommandFactory>;

    constructor(config: Config, factory: CommandFactory) {
        this.config = config;
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
            return fn(this.config, body);
        }

        return this.defaultFactory(this.config, [key, ...body]);
    }

}
