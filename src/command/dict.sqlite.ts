import { Context } from '../context';
import { IDictService, SqliteDictService } from '../service/dict';
import { ICommand, STORAGE } from './index';

import { HELP } from './dict';

export class SqliteDict implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const db = context.get(STORAGE);
        if (!db) {
            return Promise.reject('データベースがセットアップされていません。');
        }

        const service = new SqliteDictService(async () => db);

        const key = this.args[0];

        return service.getWordRandomly(key)
            .then((wd: string | undefined) => wd ? wd : key);
    }
}

export class SqliteDictEditor implements ICommand {
    private args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const db = context.get(STORAGE);
        if (!db) {
            return Promise.reject('データベースがセットアップされていません。');
        }

        const service = new SqliteDictService(async () => db);

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'list':
            case 'ls':
                return this.list(context, service);
            case 'add':
            case 'put':
            case 'push':
                return this.add(context, service);
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                return this.remove(context, service);
            case 'alias':
            case 'ln':
                return this.alias(context, service);
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async list(context: Context, service: IDictService): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 列挙対象を指定するための引数が 1 つ必要です。`);
        }

        const words = await service.listWords(subargs[0]);
        if (words) {
            return words.join('\n');
        } else {
            return Promise.resolve(`${subargs[0]} にはまだ何も登録されていません。`);
        }
    }

    public async add(context: Context, service: IDictService): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 登録対象の辞書及び登録する語の 2 つの引数が必要です。`);
        }

        const [key, newone] = subargs;

        await service.saveWord(key, newone);

        return Promise.resolve(`${key} に ${newone} を登録しました。`);
    }

    public async remove(context: Context, service: IDictService): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 削除対象の辞書及び削除する語の 2 つの引数が必要です。`);
        }

        const [key, exists] = subargs;

        await service.deleteWord(key, exists);

        return Promise.resolve(`${key} から ${exists} を削除しました。`);
    }

    public async alias(context: Context, service: IDictService): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 新しい辞書名と既存の辞書名の 2 つの引数が必要です。`);
        }
        const [newone, exists] = subargs;

        await service.aliasTitle(newone, exists);

        return Promise.resolve(`${newone} を ${exists} としても使えるようになりました。`);
    }
}
