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

export function editor(config: Config, cmd: string[]): ICommand {
    switch (config.dict) {
        case 'memory':
            return new InMemoryDictEditor(cmd);
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
            return Promise.reject('引数が一つ以上必要です。');
        }
        if (context.has(KEY) === false) {
            context.set(KEY, new Map<string, string[]>());
        }
        const dict = context.get(KEY);
        const key = this.args[0];
        const words = dict.get(key);
        if (this.args.length === 1) {
            if (words && 0 < words.length) {
                const n = context.get(RAND)();

                return Promise.resolve(words[n % words.length]);
            }
        }

        return Promise.resolve(key);
    }
}

// tslint:disable:no-any
export class InMemoryDictEditor implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Map<string, any>): Promise<string> {
        const subcmd = this.args[0];
        const newargs = this.args.slice(1);
        switch (subcmd) {
            case 'help':
            case '?':
                return this.help(context);
            case 'list':
            case 'ls':
                return this.list(context);
            case 'add':
            case 'put':
            case 'push':
                return this.add(context);
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                return this.remove(context);
            case 'alias':
            case 'ln':
                return this.alias(context);
            default:
                return Promise.resolve(`dict コマンドには ${subcmd} というサブコマンドはありません。`);
        }
    }

    public help(context: Map<string, any>): Promise<string> {
        // tslint:disable-next-line:no-multiline-string
        return Promise.resolve(`
dict [list|add|delete|alias] ...
  [list|ls] 辞書名
    指定した辞書に登録されている語を列挙します。
  [add|put|push] 辞書名 語
    指定した辞書に語を登録します。
  [delete|remove|del|rm] 辞書名 語
    指定した辞書から語を削除します。
  [alias|ln] 辞書名 辞書名
    最初に指定した辞書名を、後に指定した辞書としても利用できるようにします。
    最初に指定した辞書に語が登録されていない場合のみ使えます。
  [help|?]
    このヘルプを表示します。

コマンド例:
  dict list 駅
    駅という辞書に登録されている語を列挙します。
  dict add 駅 新宿
    駅という辞書に新宿という語を登録します。
  dict rm 駅 新宿
    駅という辞書から新宿という語を削除します。
  dict ln 駅名 駅
    駅という辞書を駅名という名前でも利用できるようにします。
`);
    }

    public list(context: Map<string, any>): Promise<string> {
        const subargs = this.args.slice(1);
        if (0 < subargs.length) {
            const dict = context.get(KEY);
            const key = subargs[0];
            const words = dict.get(key);
            if (words && 0 < words.length) {
                const ls = words.join('\n');

                return Promise.resolve(ls);
            }

            return Promise.resolve(`${key} にはまだ何も登録されていません。`);
        }

        return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 列挙対象を指定するための引数が 1 つ必要です。`);
    }

    public add(context: Map<string, any>): Promise<string> {
        const subargs = this.args.slice(1);
        if (1 < subargs.length) {
            const dict = context.get(KEY);
            const [key, newone] = subargs;
            let words = dict.get(key);
            if (!words) {
                words = [];
                dict.set(key, words);
            }
            const found = words.find((v: string) => v === newone);
            if (found) {
                return Promise.reject(`${newone} は登録済みです。`);
            }
            words.push(newone);

            return Promise.resolve(`${key} に ${newone} を登録しました。`);
        }

        return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 登録対象の辞書及び登録する語の 2 つの引数が必要です。`);
    }

    public remove(context: Map<string, any>): Promise<string> {
        const subargs = this.args.slice(1);
        if (1 < subargs.length) {
            const dict = context.get(KEY);
            const [key, exists] = subargs;
            const words = dict.get(key);
            if (!words || words.length < 1) {
                return Promise.reject(`${key} には登録された語がありません。`);
            }

            const newone = words.filter((s: string) => s !== exists);
            dict.set(key, newone);

            return Promise.resolve(`${key} から ${exists} を削除しました。`);
        }

        return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 削除対象の辞書及び削除する語の 2 つの引数が必要です。`);
    }

    public alias(context: Map<string, any>): Promise<string> {
        const subargs = this.args.slice(1);
        if (1 < subargs.length) {
            const dict = context.get(KEY);
            const [newone, exists] = subargs;
            const words = dict.get(newone);
            if (words && 0 < words.length) {
                return Promise.reject(`${newone} には語が登録済みです。語が登録されていない辞書のみを指定できます。`);
            }

            const existsWords = dict.get(exists);
            if (existsWords && 0 < existsWords.length) {
                return Promise.reject(`${exists} には語が登録されていません。語が登録されてる辞書のみを指定できます。`);
            }

            dict.set(newone, existsWords);

            return Promise.resolve(`${newone} を ${exists} としても使えるようになりました。`);
        }

        return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 新しい辞書名と既存の辞書名の 2 つの引数が必要です。`);
    }
}
