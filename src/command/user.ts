import { inject, injectable } from 'inversify';

import { Context } from '../context';
import { TYPES, UserAliasModel, UserModel, UserService } from '../service';
import { AbstractCommand } from './base';

// tslint:disable-next-line:no-multiline-string
const HELP = `
user [add|update name|update birthday|alias|remove|info|list|list alias|help]
    [add|join] [myself|me|ユーザ名]? 誕生日?
        ユーザを登録します。新規のユーザ登録は本人のみができます。
        myselfやmeをユーザ名として指定したり、ユーザ名を省略してユーザ登録した場合、SlackのDisplayNameをユーザ名として使います。
        誕生日は、MMDD形式で指定して下さい。
    update name 新しいユーザ名
        ユーザ名を変更します。ユーザ名の変更は本人のみができます。
    update birthday 誕生日
        ユーザの誕生日を変更します。誕生日の変更は本人のみができます。
        誕生日は、MMDD形式で指定して下さい。
    [alias|ln] ユーザ名? ユーザ名
        最初に指定したユーザ名を、後に指定したユーザ名としても利用できるようにします。
        最初のユーザ名を省略した場合、自分のユーザ名を指定したユーザ名としても利用できるようにします。
    [remove|delete|del|rm] alias ユーザ名
        指定したユーザ名が別名なら削除します。
    info [myself|me|ユーザ名]?
        ユーザの登録されている情報を表示します。
        myselfやmeをユーザ名として指定したり、ユーザ名の指定を省略した場合、コマンドを実行したユーザの情報を更新します。
    [list|ls]
        ユーザの一覧を表示します。
    [list|ls] alias ユーザ名?
        指定したユーザ名に関連する別名の一覧を表示します。
        ユーザ名を省略した場合、自分のユーザ名に関連する別名の一覧を表示します。
    [help|?]
        このヘルプを表示します。

コマンド例:
    user add 0220
        コマンドを実行したユーザを誕生日を2月20日として登録します。
        ユーザ名は、Slackのdisplay nameを使います。
    user add john 1104
        johnを誕生日を11月4日として登録します。
    user update name john smith
        johnのユーザ名をsmithに変更します。
    user update birthday me 1227
        コマンドを実行したユーザの誕生日を12月27に変更します。
    user alias smith
        コマンドを実行したユーザをユーザ名 smith としても扱います。
    user alias ricky peet
        ricky を peet としても扱います。
    user rm alias peet
        ユーザ名 peet が別名なら削除します。
    user ls alias ricky
        ユーザ名 ricky に関連する別名の一覧を表示します。
`;

@injectable()
export class User extends AbstractCommand {
    private service: UserService;
    constructor( @inject(TYPES.User) service: UserService) {
        super();
        this.service = service;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('user コマンドは引数が一つ以上必要です。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'add':
            case 'join':
                return this.add(context);
            case 'update':
                return this.update(context);
            case 'alias':
            case 'ln':
                return this.alias(context);
            case 'delete':
            case 'remove':
            case 'del':
            case 'rm':
                return this.remove(context);
            case 'info':
                return this.info(context);
            case 'list':
            case 'ls':
                return this.list(context);
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async add(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        const info = this.extractAddParams(context, subargs);
        await this.service.saveUser(context.user.id, info.name, info.birthday);
        return Promise.resolve(`${info.name} を登録しました。`);
    }

    public async update(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`userコマンドの ${this.args[0]} サブコマンドには 変更する属性とその内容が必要です。`);
        }

        switch (subargs[0].toLowerCase()) {
            case 'name':
                return this.service.updateUserName(context.user.id, subargs[1])
                    .then(() => `ユーザ名を ${subargs[1]} に変更しました。`);
            case 'birthday':
                return this.service.updateBirthday(context.user.id, subargs[1])
                    .then(() => `誕生日を ${subargs[1]} に変更しました。`);
            default:
                return Promise.reject(`${subargs[0]} は、 user update コマンドでサポートされていない属性です。`);
        }
    }

    public async alias(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`userコマンドの ${this.args[0]} サブコマンドには 新しいユーザ名 が必要です。`);
        }

        const info = await this.adjustUserInfo(context, subargs);
        await this.service.aliasUser(context.user.id, info.fromuid, info.toname);
        return Promise.resolve(`${info.toname} を登録しました。`);
    }

    public async remove(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2 || subargs[0].toLowerCase() !== 'alias') {
            return Promise.reject(`userコマンドの ${this.args[0]} サブコマンドには alias と ユーザ名 が必要です。`);
        }

        const name = subargs[1];
        const n = await this.service.deleteAliasByName(name);
        if (!n || n < 1) {
            return Promise.resolve(`${name} は削除されませんでした。`);
        }
        return Promise.resolve(`${name} を削除しました。`);
    }

    public async info(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (0 < subargs.length) {
            const name = subargs[0];
            const nrow = await this.service.findUserByName(name);
            if (nrow) {
                return Promise.resolve(this.toString(nrow));
            }
            return Promise.reject(`${name} というユーザは登録されていません。`);
        }

        const user = await this.service.findUserById(context.user.id);
        if (user) {
            return Promise.resolve(this.toString(user));
        }
        return Promise.reject('あなたユーザは登録されていません。');
    }

    public async list(context: Context): Promise<string> {
        const subargs = this.args.slice(1);

        if (subargs.length < 1) {
            const list = await this.service.listUser();
            return Promise.resolve(list.map(this.toString).join('\n'));
        }

        if (subargs[0].toLowerCase() !== 'alias') {
            return Promise.reject(`userコマンドの ${this.args[0]} サブコマンドには alias が必要です。`);
        }
        if (subargs.length === 1) {
            const user = await this.service.findUserById(context.user.id);
            if (!user) {
                return Promise.reject('あなたユーザは登録されていません。');
            }
            return this.listAliasById(this.service, user);
        }

        const name = subargs[1];
        const resolvedUser = await this.service.findUserByName(name);
        if (!resolvedUser) {
            return Promise.reject(`${name} はユーザ登録されていません。`);
        }
        return this.listAliasById(this.service, resolvedUser);
    }

    private async listAliasById(service: UserService, user: UserModel): Promise<string> {
        const list = await service.listAliasById(user.userid);
        const msg = [`${user.name} の別名は`].concat(
            list.map((ua: UserAliasModel) => {
                return `\t別名:${ua.name} 登録者:${ua.name_register} 登録日:${ua.timestamp}`;
            }));
        return Promise.resolve(msg.join('\n'));
    }

    private isMyself(s: string): boolean {
        return s === 'myself' || s === 'me';
    }

    private extractAddParams(context: Context, subargs: string[]): { name: string, birthday: string } {
        const result = {
            name: context.user.displayName,
            birthday: '',
        };

        if (subargs.length === 1) {
            if (this.isMyself(subargs[0]) === false && subargs[0].match(/\d{4}/)) {
                result.birthday = subargs[0];
            } else {
                result.name = subargs[0];
            }
        }

        if (subargs.length === 2) {
            if (this.isMyself(subargs[0]) === false) {
                result.name = subargs[0];
            }
            if (subargs[1].match(/\d{4}/)) {
                result.birthday = subargs[1];
            }
        }
        return result;
    }

    private toString(user: UserModel): string {
        return `ユーザID:${user.userid} ユーザ名:${user.name} 誕生日:${user.birthday} 登録日:${user.timestamp}`;
    }

    private async adjustUserInfo(context: Context, subargs: string[]):
        Promise<{ fromuid: string, toname: string }> {

        if (subargs.length === 1) {
            return {
                fromuid: context.user.id,
                toname: subargs[0],
            };
        }

        const u = await this.service.findUserByName(subargs[0]);
        if (!u) {
            return Promise.reject(`${subargs[0]} はユーザとして登録されていません。`);
        }
        return {
            fromuid: u.userid,
            toname: subargs[1],
        };
    }
}
