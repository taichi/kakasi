import { Config } from '../config';
import { Context } from '../context';
import { transaction } from '../tx.sqlite';
import { factory as echoFactory } from './echo';
import { ICommand, STORAGE } from './index';

import * as moment from 'moment';
import * as sqlite from 'sqlite';

export function factory(config: Config, cmd: string[]): Promise<ICommand> {
    switch (config.storage) {
        case 'memory':
            return echoFactory(config, cmd);
        case 'sqlite':
            return Promise.resolve(new User(cmd));
        default:
            return echoFactory(config, cmd);
    }
}

// tslint:disable-next-line:no-multiline-string
const HELP = `
user [add|update name|update birthday|info|list|help]
    [add|join] ユーザ名? 誕生日?
        ユーザを登録します。新規のユーザ登録は本人のみができます。
        ユーザ名を省略してユーザ登録した場合、SlackのDisplayNameをユーザ名として使います。
        誕生日は、MMDD形式で指定して下さい。
    update name 新しいユーザ名
        ユーザ名を変更します。ユーザ名の変更は本人のみができます。
    update birthday 誕生日
        ユーザの誕生日を変更します。誕生日の変更は本人のみができます。
        誕生日は、MMDD形式で指定して下さい。
    info [myself|me|ユーザ名]?
        ユーザの登録されている情報を表示します。
        myselfやmeをユーザ名として指定したり、ユーザ名の指定を省略した場合、コマンドを実行したユーザの情報を更新します。
    [list|ls]
        ユーザの一覧を表示します。
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
`;

type UserModel = {
    userid: string,
    name: string,
    birthday: string,
    timestamp: string,
};

export class User implements ICommand {
    public args: string[];
    constructor(cmd: string[]) {
        this.args = cmd;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('user コマンドは引数が一つ以上必要です。');
        }

        const db: sqlite.Database = context.get(STORAGE);
        if (!db) {
            return Promise.reject('データベースがセットアップされていません。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'add':
            case 'join':
                return this.add(context);
            case 'update':
                return this.update(context);
            case 'info':
                return this.info(context);
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    @transaction(STORAGE)
    public async add(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        const info = this.extractAddParams(context, subargs);

        if (moment(info.birthday, 'MMDD').isValid() === false) {
            return Promise.reject(`${info.birthday} は正しくない日付です。 MMDD形式で指定して下さい。`);
        }

        const db: sqlite.Database = context.get(STORAGE);
        const row = await db.get<{ name: string }>('select name from user where userid = ?', context.user.id);
        if (row && row.name) {
            return Promise.reject(`${info.name} は、${row.name} として既に登録済みです。ユーザ名を変更するなら user update コマンドを使って下さい。`);
        }

        const namerow = await db.get<{ cnt: number }>('select count(id) cnt from user where name = ?', info.name);
        if (namerow && 0 < namerow.cnt) {
            return Promise.reject(`${info.name} は、他のユーザが利用中のユーザ名です。`);
        }

        const bd = info.birthday ? `\"${info.birthday}\"` : 'null';
        await db.run(`insert into user (userid, name, birthday) values (?,?,${bd})`, context.user.id, info.name);

        return Promise.resolve(`${info.name} を登録しました。`);
    }

    @transaction(STORAGE)
    public async update(context: Context): Promise<string> {
        const subargs = this.args.slice(1);
        if (subargs.length < 2) {
            return Promise.reject(`userコマンドの ${this.args[0]} サブコマンドには 変更する属性とその内容が必要です。`);
        }

        const db: sqlite.Database = context.get(STORAGE);

        switch (subargs[0].toLowerCase()) {
            case 'name':
                return this.updateName(context, subargs[1]);
            case 'birthday':
                return this.updateBirthday(context, subargs[1]);
            default:
                return Promise.reject(`${subargs[0]} は、 user update コマンドでサポートされていない属性です。`);
        }
    }

    public async info(context: Context): Promise<string> {
        const db: sqlite.Database = context.get(STORAGE);
        const subargs = this.args.slice(1);
        if (0 < subargs.length) {
            const name = subargs[0];
            const nrow = await db.get<UserModel>('select userid, name, birthday, timestamp from user where name = ?', name);
            if (nrow) {
                return Promise.resolve(this.toString(nrow));
            }

            return Promise.reject(`${name} というユーザは登録されていません。`);
        }

        const row = await db.get<UserModel>('select userid, name, birthday, timestamp from user where userid = ?', context.user.id);
        if (row) {
            return Promise.resolve(this.toString(row));
        }

        return Promise.reject('あなたユーザは登録されていません。 user add me コマンドを実行するとユーザ登録できます。');
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

    private async updateName(context: Context, name: string): Promise<string> {
        const db: sqlite.Database = context.get(STORAGE);
        const namerow = await db.get<{ cnt: number }>('select count(id) as cnt from user where name = ?', name);
        if (namerow && 0 < namerow.cnt) {
            return Promise.reject(`${name} は、他のユーザが利用中のユーザ名です。`);
        }
        await db.run('update user set name = ? where userid = ?', name, context.user.id);

        return Promise.resolve(`ユーザ名を ${name} に変更しました。`);
    }

    private async updateBirthday(context: Context, birthday: string): Promise<string> {
        const db: sqlite.Database = context.get(STORAGE);
        if (moment(birthday, 'MMDD').isValid() === false) {
            return Promise.reject(`${birthday} は正しくない日付です。 MMDD形式で指定して下さい。`);
        }
        await db.run('update user set birthday = ? where userid = ?', birthday, context.user.id);

        return Promise.resolve(`誕生日を ${birthday} に変更しました。`);
    }

    private toString(user: UserModel): string {
        return `ユーザID:${user.userid} ユーザ名:${user.name} 誕生日:${user.birthday} 登録日:${user.timestamp}`;
    }
}
