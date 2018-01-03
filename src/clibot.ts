import * as random from './random';

import { core, ICommand, ICommandRepository } from './commands';
import { Config, load } from './config';
import { evaluate } from './interpreter';
import { parse } from './parser';

import * as readline from 'readline';

export class CliBot {
    // tslint:disable-next-line:no-any
    private context: Map<string, any>;
    private repos: ICommandRepository;

    constructor(config: Config) {
        this.context = new Map();
        this.context.set(random.KEY, random.make());
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
            const nodes = parse(line.trim());
            const pros = evaluate(this.repos, this.context, nodes)
                .then((cmd: ICommand) => cmd.execute(this.context));
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

new CliBot(load(process.argv[2])).run();
