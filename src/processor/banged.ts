import { inject, injectable } from 'inversify';

import { CommandRepository, TYPES } from '../command';
import { Context } from '../context';
import { Processor } from './';

@injectable()
export class BangedMessageProcessor implements Processor<string> {

    private repos: CommandRepository;

    public constructor(@inject(TYPES.REPOSITORY) repos: CommandRepository) {
        this.repos = repos;
    }

    public async process(context: Context, message: string): Promise<string> {
        if (this.supports(message)) {
            return context.evaluate(this.repos, message.slice(1));
        }
        return '';
    }

    private supports(message: string): boolean {
        return !!message && 2 < message.length && message.startsWith('!');
    }
}
