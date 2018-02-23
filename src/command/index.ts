import { Container, ContainerModule, injectable, interfaces } from 'inversify';

import { Context } from '../context';
import { Dict, DictEditor } from './dict';
import { Echo } from './echo';
import { User } from './user';

export const DEFAULT_COMMAND = Symbol.for('command/default');

export interface Command {
    initialize(args: string[]): this;
    execute(context: Context): Promise<string>;
}

export interface CommandRepository {
    find(command: string[]): Command;
}

export class CommandRepository implements CommandRepository {

    private container: Container;

    constructor(container: Container) {
        this.container = container;
    }

    public find(command: string[]): Command {
        const [key, ...body] = command;
        try {
            const cmd = this.container.get<Command>(key.toLowerCase());
            return cmd.initialize(body);
        } catch (e) {
            // tslint:disable-next-line:no-unsafe-any
            if (e && e.message.startsWith('No matching bindings found')) {
                const cmd = this.container.get<Command>(DEFAULT_COMMAND);
                return cmd.initialize(command);
            }
            throw e;
        }
    }
}

export const CORE_MODULE = new ContainerModule(
    (
        bind: interfaces.Bind,
        unbind: interfaces.Unbind,
        isBound: interfaces.IsBound,
        rebind: interfaces.Rebind,
    ) => {
        bind(DEFAULT_COMMAND).to(Dict);
        bind('dict').to(DictEditor);
        bind('echo').to(Echo);
    },
);
