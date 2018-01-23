import { injectable } from 'inversify';

import { Context } from '../context';
import { AbstractCommand } from './index';

@injectable()
export class Echo extends AbstractCommand {
    public execute(context: Context): Promise<string> {
        return Promise.resolve(this.args.join(' '));
    }
}
