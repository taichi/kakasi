import { inject, injectable } from 'inversify';

import { Context } from '../context';
import { IDictService, TYPES } from '../service';
import { AbstractCommand } from './base';

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

@injectable()
export class Dict extends AbstractCommand {
    private service: IDictService;
    constructor( @inject(TYPES.Dict) service: IDictService) {
        super();
        this.service = service;
    }

    public execute(context: Context): Promise<string> {
        if (!this.args || this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const key = this.args[0];

        return this.service.getWordRandomly(key)
            .then((wd: string | undefined) => wd ? wd : key);
    }
}

@injectable()
export class DictEditor extends AbstractCommand {
    private service: IDictService;
    constructor( @inject(TYPES.Dict) service: IDictService) {
        super();
        this.service = service;
    }

    public execute(context: Context): Promise<string> {
        if (!this.args || this.args.length < 1) {
            return Promise.reject('dict コマンドは引数が一つ以上必要です。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
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

    public async list(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 列挙対象を指定するための引数が 1 つ必要です。`);
        }

        const words = await this.service.listWords(subargs[0]);
        if (words && 0 < words.length) {
            return words.join('\n');
        } else {
            return Promise.resolve(`${subargs[0]} にはまだ何も登録されていません。`);
        }
    }

    public async add(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 登録対象の辞書及び登録する語の 2 つの引数が必要です。`);
        }

        const [key, newone] = subargs;

        await this.service.saveWord(key, newone);

        return Promise.resolve(`${key} に ${newone} を登録しました。`);
    }

    public async remove(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 削除対象の辞書及び削除する語の 2 つの引数が必要です。`);
        }

        const [key, exists] = subargs;

        await this.service.deleteWord(key, exists);

        return Promise.resolve(`${key} から ${exists} を削除しました。`);
    }

    public async alias(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`dictコマンドの ${this.args[0]} サブコマンドには 新しい辞書名と既存の辞書名の 2 つの引数が必要です。`);
        }
        const [newone, exists] = subargs;

        await this.service.aliasTitle(newone, exists);

        return Promise.resolve(`${newone} を ${exists} としても使えるようになりました。`);
    }
}
