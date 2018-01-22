import { Container } from 'inversify';

import { Config } from '../config';
import { Context } from '../context';
import { editor as DictEd, factory as Dict } from './dict';
import { factory as Echo } from './echo';

export const STORAGE = 'kakasi/storage';

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
    private container: Container;

    constructor(config: Config, factory: CommandFactory, container: Container = new Container()) {
        this.config = config;
        this.defaultFactory = factory;
        this.container = container;
    }

    public register(key: string, factory: CommandFactory): this {
        this.container.bind(key).toFactory(() => factory);

        return this;
    }

    public find(command: string[]): Promise<ICommand> {
        const [key, ...body] = command;
        try {
            const fn = this.container.get<CommandFactory>(key);
            return fn(this.config, body);
        } catch (e) {
            return this.defaultFactory(this.config, [key, ...body]);
        }
    }
}

export function core(config: Config, container: Container): ICommandRepository {
    const cr = new CommandRepository(config, Dict, container);
    cr.register('dict', DictEd);
    cr.register('echo', Echo);

    return cr;
}
