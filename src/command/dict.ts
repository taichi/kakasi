import { Config } from '../config';
import { Context } from '../context';
import { SqliteDict, SqliteDictEditor } from './dict.sqlite';
import { factory as echoFactory } from './echo';
import { ICommand, STORAGE } from './index';

export function factory(config: Config, cmd: string[]): Promise<ICommand> {
    switch (config.storage) {
        case 'memory':
            return Promise.resolve(new InMemoryDict(cmd));
        case 'sqlite':
            return Promise.resolve(new SqliteDict(cmd));
        default:
            return echoFactory(config, cmd);
    }
}

export function editor(config: Config, cmd: string[]): Promise<ICommand> {
    switch (config.storage) {
        case 'memory':
            return Promise.resolve(new InMemoryDictEditor(cmd));
        case 'sqlite':
            return Promise.resolve(new SqliteDictEditor(cmd));
        default:
            return echoFactory(config, cmd);
    }
}

// tslint:disable-next-line:no-multiline-string
export const HELP = `
dict [list|add|delete|alias|help] ...
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
`;

export class InMemoryDict implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }
        const dict = context.get(STORAGE);
        const key = this.args[0];
        if (dict) {
            const words = dict.get(key);
            if (words && 0 < words.length) {
                const n = context.rand();

                return Promise.resolve(words[n % words.length]);
            }
        }

        return Promise.resolve(key);
    }
}

export class InMemoryDictEditor implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }
        if (context.has(STORAGE) === false) {
            context.set(STORAGE, new Map<string, string[]>());
        }

        const subcmd = this.args[0];
        switch (subcmd.toLocaleLowerCase()) {
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
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public list(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 列挙対象を指定するための引数が 1 つ必要です。`);
        }
        const dict = context.get(STORAGE);
        const key = subargs[0];
        const words = dict.get(key);
        if (words && 0 < words.length) {
            const ls = words.join('\n');

            return Promise.resolve(ls);
        }

        return Promise.resolve(`${key} にはまだ何も登録されていません。`);
    }

    public add(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 登録対象の辞書及び登録する語の 2 つの引数が必要です。`);
        }
        const dict = context.get(STORAGE);
        const [key, newone] = subargs;
        let words = dict.get(key);
        if (!words) {
            words = [];
            dict.set(key, words);
        }
        const found = words.find((v: string) => v === newone);
        if (found) {
            return Promise.reject(`${key} に ${newone} は登録済みです。`);
        }
        words.push(newone);

        return Promise.resolve(`${key} に ${newone} を登録しました。`);

    }

    public remove(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 削除対象の辞書及び削除する語の 2 つの引数が必要です。`);
        }
        const dict = context.get(STORAGE);
        const [key, exists] = subargs;
        const words = dict.get(key);
        if (!words || words.length < 1) {
            return Promise.reject(`${key} という辞書が無いか、それに登録された語がありません。`);
        }

        const newone = words.filter((s: string) => s !== exists);
        dict.set(key, newone);

        return Promise.resolve(`${key} から ${exists} を削除しました。`);
    }

    public alias(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 新しい辞書名と既存の辞書名の 2 つの引数が必要です。`);
        }
        const dict = context.get(STORAGE);
        const [newone, exists] = subargs;
        const words = dict.get(newone);
        if (words && 0 < words.length) {
            return Promise.reject(`${newone} には語が登録済みです。語が登録されていない辞書のみを指定できます。`);
        }

        const existsWords = dict.get(exists);
        if (!existsWords || existsWords.length < 1) {
            return Promise.reject(`${exists} には語が登録されていません。語が登録されている辞書のみを指定できます。`);
        }

        dict.set(newone, existsWords);

        return Promise.resolve(`${newone} を ${exists} としても使えるようになりました。`);
    }
}
