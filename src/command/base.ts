import { injectable } from 'inversify';

import { Context } from '../context';
import { ICommand } from './';

@injectable()
export abstract class AbstractCommand implements ICommand {
    protected args: string[];
    public initialize(args: string[]): this {
        this.args = args;
        return this;
    }
    public abstract execute(context: Context): Promise<string>;
}
