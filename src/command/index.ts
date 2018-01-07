import { editor as DictEd, factory as Dict } from './dict';
import { factory as Echo } from './echo';

import { Config } from '../config';
import { Context } from '../context';

export interface ICommand {
    execute(context: Context): Promise<string>;
}

export type CommandFactory = (config: Config, cmd: string[]) => Promise<ICommand>;

export interface ICommandRepository {

    register(key: string, factory: CommandFactory): this;

    find(command: string[]): Promise<ICommand>;
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

    public find(command: string[]): Promise<ICommand> {
        const [key, ...body] = command;
        const fn = this.commands.get(key);
        if (fn) {
            return fn(this.config, body);
        }

        return this.defaultFactory(this.config, [key, ...body]);
    }
}

export function core(config: Config): ICommandRepository {
    const cr = new CommandRepository(config, Dict);
    cr.register('dict', DictEd);
    cr.register('echo', Echo);

    return cr;
}
