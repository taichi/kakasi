import { ICommand } from '../commands';
import { Config } from '../config';
import { KEY as RAND } from '../random';
import { Echo } from './echo';

export function factory(config: Config, cmd: string[]): ICommand {
    switch (config.dict) {
        case 'memory':
            return new InMemoryDict(cmd);
        default:
            return new Echo(cmd);
    }
}

const KEY = 'command/InMemoryDict';

export class InMemoryDict implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }
    // tslint:disable-next-line:no-any
    public execute(context: Map<string, any>): Promise<string> {
        if (this.args.length < 1) {
            return Promise.resolve('引数が一つ以上必要です。');
        }
        if (context.has(KEY) === false) {
            context.set(KEY, new Map<string, string[]>());
        }
        const dict = context.get(KEY);
        const key = this.args[0];
        let words = dict.get(key);
        if (this.args.length === 1) {
            if (words && 0 < words.length) {
                const n = context.get(RAND)();

                return Promise.resolve(words[n % words.length]);
            }

            return Promise.resolve(key);
        }

        if (!words) {
            words = [];
            dict.set(key, words);
        }
        const newone = this.args[1];
        const found = words.find((v: string) => v === newone);
        if (found) {
            return Promise.resolve(`${newone} は登録済みです。`);
        }
        words.push(newone);

        return Promise.resolve(`${key} に ${newone} を登録しました。`);
    }
}
