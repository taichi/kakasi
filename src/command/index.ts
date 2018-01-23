import { Container, injectable } from 'inversify';

import { Context } from '../context';

export const DEFAULT_COMMAND = Symbol.for('command/default');

export interface ICommand {
    initialize(args: string[]): this;
    execute(context: Context): Promise<string>;
}

@injectable()
export abstract class AbstractCommand implements ICommand {
    protected args: string[];
    public initialize(args: string[]): this {
        this.args = args;
        return this;
    }
    public abstract execute(context: Context): Promise<string>;
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
            const cmd = this.container.get<ICommand>(key);
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
