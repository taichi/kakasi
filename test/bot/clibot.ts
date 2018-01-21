import { core, ICommandRepository } from '../../src/command';
import { Config, load } from '../../src/config';
import { Context } from '../../src/context';
import { RuntimeUser } from '../../src/user';

import { dummy } from '../testutil';

import * as readline from 'readline';

export class CliBot {
    private context: Context;
    private repos: ICommandRepository;

    constructor(user: RuntimeUser, config: Config) {
        this.context = new Context(user);
        this.repos = core(config);
    }

    // tslint:disable:no-console
    public run() {
        const cli = readline.createInterface(process.stdin, process.stdout);
        cli.setPrompt('> ');

        cli.on('line', (line: string) => {
            if (line === 'exit') {
                cli.emit('close');

                return;
            }
            const pros = this.context.evaluate(this.repos, line.trim());
            Promise.resolve(pros).then((str: string) => {
                console.log(str);
                cli.prompt();
            }).catch((msg: string) => {
                console.error(msg);
                cli.prompt();
            });
        }).on('close', () => {
            console.log('');
            process.exit(0);
        });

        cli.prompt();
    }
}

new CliBot(dummy(), load(process.argv[2])).run();
