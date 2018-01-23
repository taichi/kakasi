import { Container, ContainerModule, injectable, interfaces } from 'inversify';

import { Context } from '../context';
import { Dict, DictEditor } from './dict';
import { Echo } from './echo';
import { User } from './user';

export const DEFAULT_COMMAND = Symbol.for('command/default');

export interface ICommand {
    initialize(args: string[]): this;
    execute(context: Context): Promise<string>;
}

export interface ICommandRepository {
    find(command: string[]): ICommand;
}

export class CommandRepository implements ICommandRepository {

    private container: Container;

    constructor(container: Container) {
        this.container = container;
    }

    public find(command: string[]): ICommand {
        const [key, ...body] = command;
        try {
            const cmd = this.container.get<ICommand>(key.toLowerCase());
            return cmd.initialize(body);
        } catch (e) {
            if (e.message.startsWith('No matching bindings found')) {
                const cmd = this.container.get<ICommand>(DEFAULT_COMMAND);
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
