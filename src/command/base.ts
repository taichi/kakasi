import { injectable } from 'inversify';

import { Context } from '../context';
import { Command } from './';

@injectable()
export abstract class AbstractCommand implements Command {
    protected args: string[] = [];
    public initialize(args: string[]): this {
        this.args = args;
        return this;
    }
    public abstract execute(context: Context): Promise<string>;
}
