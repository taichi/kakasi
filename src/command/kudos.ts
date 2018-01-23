import { inject, injectable } from 'inversify';

import { Context } from '../context';
import { IKudosService, TYPES } from '../service';
import { KudosRankingModel } from '../service/kudos';
import { IUserService } from '../service/user';
import { AbstractCommand } from './base';

// tslint:disable-next-line:no-multiline-string
const HELP = `
kudos [++|--|show|ranking|sender_ranking|history|reaction|help]
    [++|add|increment] ユーザ名
    [--|remove|decrement] ユーザ名
    [info|show] ユーザ名?
    [ranking|rank]
        現在のkudosが最も多いユーザと最も少ないユーザをそれぞれ10人ずつ表示します。
    [sender_ranking|sender_rank]
        送信回数が多い上位五人を表示します。
    [history]
        直近10件の送信履歴を表示します。
    reaction [++|increment|positive] アイコン
        発言者のkudosを増やすリアクションアイコンを登録します。
    reaction [--|decrement|positive] アイコン
        発言者のkudosを減らすリアクションアイコンを登録します。
    reaction [remove|delete|rm|del] アイコン
        kudosを増減するリアクションアイコンの登録を削除します。
    reaction list
        kudosを増減するリアクションアイコンの一覧を表示します。
    [help|?]
        このヘルプを表示します。

コマンド例:
    kudos ++ john
        johnのkudosを増やします。
    kudos -- john
        johnのkudosを減らします。
    kudos show
        コマンドを実行したユーザのkudos量を表示します。
    kudos show john
        johnのkudos量を表示します。
    kudos reaction increment :+1:
        :+1: アイコンが付いたメッセージの発言者のkudosを増加させます。
    kudos reaction decrement :-1:
        :-1: アイコンが付いたメッセージの発言者のkudosを減少させます。
    kudos reaction rm :+1:
        :+1: アイコンによってkudosの増減を無くします。
`;

@injectable()
export class Kudos extends AbstractCommand {
    private user: IUserService;
    private kudos: IKudosService;

    constructor( @inject(TYPES.User) user: IUserService, @inject(TYPES.Kudos) kudos: IKudosService) {
        super();
        this.user = user;
        this.kudos = kudos;
    }

    public execute(context: Context): Promise<string> {
        if (this.args.length < 1) {
            return Promise.reject('kudos コマンドは引数が一つ以上必要です。');
        }

        const subcmd = this.args[0];
        switch (subcmd.toLowerCase()) {
            case 'add':
            case 'increment':
            case '++':
                return this.increment(context);
            case 'remove':
            case 'decrement':
            case '--':
                return this.decrement(context);
            case 'info':
            case 'show':
                return this.info(context);
            case 'ranking':
            case 'rank':
                return this.rank(context);
            case 'sender_ranking':
            case 'sender_rank':
                return this.sender_rank(context);
            case 'history':
                return this.history(context);
            case 'reaction':
                return this.reaction(context);
            case 'help':
            case '?':
            default:
                return this.help(context);
        }
    }

    public help(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async increment(context: Context): Promise<string> {
        return this.updateKudos(context, '+ 1', 1);
    }

    public async decrement(context: Context): Promise<string> {
        return this.updateKudos(context, '- 1', -1);
    }

    public async info(context: Context): Promise<string> {
        const subargs = this.args.slice(1);

        const uinfo = await this.fillUerInfo(context.user.id, subargs[0]);

        const quantity = await this.kudos.findKudosById(uinfo.userid);
        const current = quantity ? quantity.quantity : 0;

        return `${uinfo.username}:${current} pt`;
    }

    public async rank(context: Context): Promise<string> {
        return `kudos トップ10
${await this.formatRanks('desc')}

kudos ワースト10
${await this.formatRanks('asc')}
`;
    }

    public async sender_rank(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async history(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    public async reaction(context: Context): Promise<string> {
        return Promise.resolve(HELP);
    }

    private async formatRanks(order: string): Promise<string> {
        const ranks = await this.kudos.getRanking('desc');
        return ranks.map((v: KudosRankingModel, i: number) => {
            const s = `${i + 1}`.padStart(2);
            return `${s}位: ${v.username} (${v.quantity} pt)`;
        }).join('\n');
    }

    private async updateKudos(context: Context, val: string, diff: number) {
        const subargs = this.args.slice(1);
        if (subargs.length < 1) {
            return Promise.reject(`kudos コマンドの ${this.args[0]} サブコマンドには対象となるユーザ名が必要です。`);
        }
        const username = subargs[0];
        const uinfo = await this.user.findUserByName(username);
        if (!uinfo || !uinfo.userid) {
            return Promise.reject(`${username} はユーザとして登録されていません。`);
        }

        const myUinfo = await this.user.findUserById(context.user.id);
        if (!myUinfo) {
            return Promise.reject('あなたはユーザとして登録されていません。user add me コマンドを実行するとユーザ登録できます。');
        }

        const current = await this.kudos.saveKudos(context.user.id, uinfo.userid, diff);

        return Promise.resolve(`${username}:${current} pt`);
    }

    private async fillUerInfo(uid: string, un: string): Promise<{ userid: string, username: string }> {
        if (un) {
            return {
                userid: await this.getUserId(un),
                username: un,
            };
        }

        return {
            userid: uid,
            username: await this.getUsername(uid),
        };
    }

    private async getUsername(userid: string): Promise<string> {
        const uinfo = await this.user.findUserById(userid);
        if (!uinfo) {
            return Promise.reject('あなたはユーザとして登録されていません。user add me コマンドを実行するとユーザ登録できます。');
        }

        return uinfo.name;
    }

    private async getUserId(username: string): Promise<string> {
        const uinfo = await this.user.findUserByName(username);
        if (!uinfo) {
            return Promise.reject(`${username} はユーザとして登録されていません。`);
        }

        return uinfo.userid;
    }
}
