import { Container, ContainerModule, injectable, interfaces } from 'inversify';

import { Context } from '../context';
import { Dict, DictEditor } from './dict';
import { Echo } from './echo';
import { User } from './user';

export const TYPES = {
    DEFAULT_COMMAND: Symbol.for('command/default'),
    REPOSITORY: Symbol.for('command/CommandRepository'),
};

export interface Command {
    initialize(args: string[]): this;
    execute(context: Context): Promise<string>;
}

export interface CommandRepository {
    find(command: string[]): Command;
}

export class ContainerCommandRepository implements CommandRepository {

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
                const cmd = this.container.get<Command>(TYPES.DEFAULT_COMMAND);
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
        bind(TYPES.DEFAULT_COMMAND).to(Dict);
        bind('dict').to(DictEditor);
        bind('echo').to(Echo);
        bind('user').to(User);
    },
);
