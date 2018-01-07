import { Config } from '../config';
import { Context } from '../context';
import { ICommand } from './index';

export function factory(config: Config, cmd: string[]): Promise<ICommand> {
    return Promise.resolve(new Echo(cmd));
}

export class Echo implements ICommand {
    public args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }
    public execute(context: Context): Promise<string> {
        return Promise.resolve(this.args.join(' '));
    }
}
