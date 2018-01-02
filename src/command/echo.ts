import { ICommand } from '../commands';
import { Config } from '../config';

export function factory(config: Config, cmd: string[]): ICommand {
    return new Echo(cmd);
}

export class Echo implements ICommand {
    public args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }
    public execute(context: Map<string, {}>): Promise<string> {
        return Promise.resolve(this.args.join(' '));
    }
}
